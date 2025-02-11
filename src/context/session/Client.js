const promiseLimit = require('promise-limit');

const config = {
  sessionStorage: window.sessionStorage,
};
// const EventSource = EventSourcePolyfill;

// const promiseLimit = require('promise-limit');

const POLL_INTERVAL = 60000; // msecs to poll URIs if no event connection
const TAB_ID = `${Date.now()}-${Math.random()}`; // unique ID per tab

/**
 * A RedfishMonitor object encapsulates a list of URIs a client cares about and
 * a callback to call whenever any of those URIs is first discovered or changes.
 * A client should not create these object directly, but instead use
 * createMonitor() from a RedfishClient object.
 */
class RedfishMonitor {
  static numCreated = 0;

  constructor(uris, callback, forcePoll) {
    this.uris = uris;
    this.callback = callback;
    this.forcePoll = forcePoll;
    this.poll = null;
    // Each object gets a unique number just to make it easy to track each one.
    this.num = RedfishMonitor.numCreated;
    RedfishMonitor.numCreated += 1;
  }
}

/**
 * A AfoozoClient object provides an API to the backend server.
 * It caches data as needed to improve performance, without the client having
 * to think about it.
 * You must have a successful login() call on a AfoozoClient before any other
 * method can be expected to work.
 * After a logout or session expiration, you should create a new object if you
 * want to login again.
 */
class AfoozoClient {
  constructor(devMode, devModeSsePoll) {
    // The authenticated redfish session.
    this.session = null;

    this.mockup = 'http://localhost:5000';
    // List of RedfishMonitors.
    this.monitors = [];

    // Redfish event connection.
    this.events = undefined;
    this.eventsFailed = false;
    this.sseOwner = null;
    this.eventChannel = new BroadcastChannel('event-channel');
    this.eventChannel.addEventListener(
      'message',
      this.handleEventChannelMessage,
    );
    this.sseOwnerTimer = null;

    // A cache of resources we have already gotten.
    this.resourceCache = {};

    // A cache of resources we are currently loading.
    this.loadingCache = {};

    // This limits us to a maximum of 10 concurrent redfish requests.
    this.limit = promiseLimit(10);

    // If set, we call this to resolve a promise waiting on all pending GETs
    // to complete.
    this.fetchWaiterResolver = null;

    // A handle for an XHR file upload request
    this.xhr = null;
    this.xhrAborted = false;

    window.addEventListener('unload', () => {
      if (window.localStorage.getItem('sse-owner') === TAB_ID) {
        window.localStorage.removeItem('sse-owner');
      }
      this.eventChannel.postMessage({ out: true, id: TAB_ID });
      this.eventChannel.close();
      if (this.events) {
        this.events.close();
      }
    });
  }

  /**
   * Attempt to use data saved in sessionStorage to restore a previous session.
   * Return true if it worked.
   * This does not check that the restored session still works. Use async
   * testRestoredSession for that if this returns true.
   */
  restoreSession = () => {
    const token = config.sessionStorage.getItem('session-token');
    const username = config.sessionStorage.getItem('session-uri');
    const email = config.sessionStorage.getItem('session-user');
    const role = config.sessionStorage.getItem('session-role');

    if (token && username && email && role) {
      this.session = {
        token,
        username,
        email,
        role
      };
      return true;
    }
    return false;
  };

  /**
   * Asychronous check of whether a restored session still works.
   * Returns true if it works.
   */
  testRestoredSession = () => {
    if (!this.session?.token) {
      return Promise.resolve(false);
    }

    return fetch('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${this.session.token}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Session invalid');
        return res.json();
      })
      .then(json => {
        this.session.username = json.Username;
        this.session.email = json.Email;
        this.session.role = json.Role;
        return true;
      })
      .catch(() => {
        this.sessionExpired();
        return false;
      });
  };

  /**
   * This should be called before any other methods.
   * @param email - The username to log in with.
   * @param password - The password to log in with.
   * Returns a promise containing a Response object.
   */
  login(email, password) {
    const uri = '/api/auth/login';
    return this.post(uri, { email, password }).then((res) => {
      if (res.status !== 200) {
        return res;
      }
      // The login worked! Save info about the created session.
      return res.json().then((json) => {
        this.initSession(
          json?.token,
          json?.user?.username,
          json?.user?.email,
          json?.user?.role,
        );
        // Return the full response data
        return {
          status: res.status,
          user: {
            username: json?.user?.username,
            email: json?.user?.email,
            role: json?.user?.role
          },
          token: json?.token
        };
      });
    });
  }

  /**
   * Delete the session created by login().
   */
  logout = () => {
    return fetch('/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.session ? this.session.token : null}`,
      },
    })
      .then(() => {
        // Clear session storage
        config.sessionStorage.removeItem('session-token');
        config.sessionStorage.removeItem('session-uri');
        config.sessionStorage.removeItem('session-user');
        config.sessionStorage.removeItem('session-role');

        // Clear session data
        this.session = null;

        // Close event source if it exists
        if (this.events) {
          this.events.close();
          this.events = undefined;
        }

        return true;
      })
      .catch((error) => {
        console.error('Logout error:', error);
        // Still clear local session data even if server request fails
        this.session = null;
        return false;
      });
  };

  /**
   * Called to inform that session has expired.
   */
  sessionExpired() {
    this.session = null;
    this.rmSession();
    this.onSessionExpired();
    this.onSessionExpired = () => { };
    this.monitors.forEach((monitor) => this.rmMonitor(monitor));
  }

  /**
   * Called whenever the session created by login() has expired.
   * Clients should assign whatever custom function they want to this.
   * This will get reset to its default on logout or session expiration,
   * to avoid triggering the custom logic many times when there are multiple
   * pending fetches when a session expires.
   */
  onSessionExpired = () => { };

  /**
   * Called whenver a logout is intentionally done.
   * Clients should assign whatever custom function they want to this.
   */
  onLogout = () => { };

  /**
   * Called whenever the event connection succeeds.
   * Clients should assign whatever custom function they want to this.
   */
  onEventSuccess = () => { };

  /**
   * Called whenever the event connection fails.
   * Clients should assign whatever custom function they want to this.
   */
  onEventFailure = () => { };

  /**
   * Called whenever an event is received, passing in the event JSON.
   * Clients should assign whatever custom function they want to this.
   */
  onEvent = () => { };

  /**
   * Create and return a RedfishMonitor.
   * Whenever any provided URI is first discovered or changes, the provided
   * callback function is called. It is passed an object with a key/value pair
   * for every URI requested to be monitored. The key is the URI, and the value
   * is the JSON object of that redfish resource. If the resource does not
   * exist or has not yet been discovered, it will be undefined.
   * TODO: Shouldn't client have a way to differentiate the 2 above cases?
   * Creating a monitor for a URI will trigger RedfishClient to get that URI.
   * When a monitor is no longer needed, rmMonitor() must be called with it.
   * @param uris - A list of URIs to monitor. Can use $expand=* notation, but
   *               only on the URI of a collection.
   * @param callback - A function to call when a monitored URI is updated.
   * @param forcePoll - Boolean or integer value. Set to true or non-zero to
   *                    poll the URIs rather than relying on the cache, events
   *                    and etags.
   *                      - false or zero   : disable polling
   *                      - true            : use default poll interval
   *                      - non-zero integer: poll period.
   */
  createMonitor = (uris, callback, forcePoll = false) => {
    const monitor = new RedfishMonitor(uris, callback, forcePoll);
    this.monitors.push(monitor);
    const getEmAll = () => {
      uris.forEach((uri) => {
        this.get(uri, !this.eventsFailed && !forcePoll);
      });
    };
    getEmAll();
    if (this.eventsFailed || forcePoll) {
      monitor.poll = setInterval(
        getEmAll,
        typeof forcePoll === 'number' && forcePoll ? forcePoll : POLL_INTERVAL,
      );
    }
    return monitor;
  };

  /**
   * Update a monitor which may already exist. Return the updated monitor.
   * @param uris - Same as in createMonitor.
   * @param callback - Same as in createMonitor.
   * @param monitor - The monitor which has already been created.
   */
  updateMonitor = (uris, callback, monitor) => {
    if (monitor) {
      this.rmMonitor(monitor);
    }
    return this.createMonitor(uris, callback);
  };

  /**
   * Remove a monitor that had been created by createMonitor.
   */
  rmMonitor = (monitor) => {
    if (monitor.poll) {
      clearInterval(monitor.poll);
    }
    this.monitors = this.monitors.filter((x) => x.num !== monitor.num);
  };

  /**
   * Get a redfish resource.
   * If using a RedfishMonitor, it is not necessary to use this.
   * Return a promise containing the redfish resource JSON object.
   * Or throw an error if that fails.
   * @param uriArg - The URI to get. Can use $expand=* notation, but only if
   *                 targeting a collection.
   * @param isCacheOk - if it's OK to return cached value. Default: true.
   */
  get = (uriArg, isCacheOk = true) => {
    // Don't want to treat /redfish/v1/ and /redfish/v1 as different
    const [path, query] = uriArg.split('?');
    if (query && query !== '$expand=*') {
      throw new Error(`RedfishClient doesnt support query ${query}`);
    }
    const uri = path.replace(/\/$/, '') + (query ? `?${query}` : '');
    return this.limit(() => this.reallyGet(uri, isCacheOk));
  };

  /**
   * Do a GET against a URI, just return the Promise from the fetch call.
   * Skips all the JSONifying, error throwing, and caching done by get().
   * @param uri - The URI to get.
   */
  rawGet = (uri) => fetch(...this.getFetchArgs(uri, false));

  /**
   * Post data to a redfish URI.
   * Return a promise containing a Response object.
   * @param uriArg - the URI to post to.
   * @param data - the JSON object to post.
   */
  post(uriArg, data) {
    const uri = uriArg.replace(/\/$/, '');
    return fetch(`${this.mockup}${uri}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.session ? this.session.token : null}`,
      },
      body: JSON.stringify(data),
    }).then((res) => {
      this.checkSessionLoss(res);
      if (res.status === 201) {
        // This POST created a new redfish resource on this collection.
        // If not receiving events, re-GET this URI if cached since it has
        // been updated.

        // Race Condition:
        // Most URIs require the session to be established, otherwise the GET
        // request will return 401, which results in the GUI logging out.
        // This can occur during the initial login when the resource cache
        // contains "/redfish/v1/SessionService/Sessions". This has been traced
        // to handleRedfishEvent being called prior to this POST request
        // completing. It occurs with multiple logins because the SSE
        // subscription is established on the first login and subsequent tabs
        // share it. This means a subsequent login can already be receiving
        // events before the session is established.
        //
        // DEBUG that demonstrates the race condition:
        // console.log('*** RedfishClient post', {
        //   uri,
        //   cache: this.resourceCache,
        //   session: this.session,
        //   sessionInCache: Boolean(
        //     this.resourceCache['/redfish/v1/SessionService/Sessions'],
        //   ),
        //   errorCondition:
        //     !!(uri === '/redfish/v1/SessionService/Sessions' &&
        //     !this.session &&
        //     this.resourceCache['/redfish/v1/SessionService/Sessions']),
        // });
        if (this.session && this.events?.readyState !== EventSource.OPEN) {
          [uri, this.getExpandedUri(uri)].forEach((u) => {
            if (u in this.resourceCache) {
              this.get(u, false);
            }
          });
        }
      }
      return res;
    });
  }

  /**
   * Patch a redfish resource. A patch selectively updates parts of redfish.
   * Return a promise containing a Response object.
   * @param uriArg - the URI to patch.
   * @param data - the JSON object to patch with.
   */
  patch(uri, data) {
    return this.putOrPatch(uri, data, 'PATCH');
  }

  /**
   * PUT a redfish resource. A put entirely replaces a part of redfish.
   * Return a promise containing a Response object.
   * @param uriArg - the URI to put.
   * @param data - the JSON object to put with.
   */
  put(uri, data) {
    return this.putOrPatch(uri, data, 'PUT');
  }

  /**
   * Delete a redfish URI.
   * Return a promise containing a Response object.
   * @param uri - the URI to delete.
   */
  delete(uri) {
    return fetch(`${this.mockup}${uri}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.session ? this.session.token : null}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
    }).then((res) => {
      this.checkSessionLoss(res);
      if (res.ok && res.status !== 202) {
        // delete this resource from our cache
        this.rmFromResourceCache(uri);
      }
      return res;
    });
  }

  /**
   * Return a promise that is resolved the next time a redfish get completes
   * and there are no other redfish gets in progress.
   * This can be used to know when a page is finished loading data from redfish.
   */
  waitForFetches() {
    return new Promise((resolve) => {
      if (this.fetchWaiterResolver !== null) {
        const resolver = this.fetchWaiterResolver;
        setTimeout(() => resolver());
      }
      this.fetchWaiterResolver = resolve;
    });
  }

  /** END OF PUBLIC METHODS. EVERYTHING BELOW HERE IS ONLY FOR INTERNAL USE */

  /**
   * Do the real work to get a redfish resource.
   * This is outside of get() only so that get() can wrap this in PromiseLimit,
   * to limit the number of concurrent GETs we make to the backend.
   */
  reallyGet(uri, isCacheOk) {
    // If we've already gotten this URI, return the cached result.
    if (isCacheOk && !this.eventsFailed && uri in this.resourceCache) {
      const { body } = this.resourceCache[uri];
      return new Promise((resolve) => {
        // Simulate a very quick asynchronous call.
        // Otherwise, pages loading lots of cached data will seem to hang
        // while all the data is being grabbed from the cache and processed.
        setTimeout(() => {
          this.doMonitorCallbacksForUri(uri);
          this.resolveFetchWaiter();
          return resolve(body);
        });
      });
    }

    // If we're already waiting on a response for this URI, return that.
    if (uri in this.loadingCache) {
      return this.loadingCache[uri];
    }

    let etag = null;
    const promise = fetch(...this.getFetchArgs(uri, true))
      .then((res) => {
        this.checkSessionLoss(res);
        if (res.status === 404) {
          this.rmFromResourceCache(uri);
        } else if (res.status === 304) {
          // Resource hasn't changed since our last GET.
          return this.resourceCache[uri].body;
        }
        if (!res.ok) {
          this.doneLoading(uri);
          throw new Error(`Failed to get ${uri}`);
        }
        // For expanded collections, the etag in the header is the one we want.
        // The one inside the JSON body as @odata.etag is the etag of the
        // unexpanded collection.
        etag = res.headers.get('ETag');
        return res.json();
      })
      .then((json) => {
        // the mockup server returns data in the Body property
        /* eslint-disable no-param-reassign */
        if (this.mockup && json.Body) json = json.Body;
        this.addToResourceCache(uri, json, etag);
        this.doneLoading(uri);
        return json;
      })
      .catch((e) => {
        this.doneLoading(uri);
        console.error(
          // eslint-disable-next-line max-len
          `[AfoozoClient::reallyGet:fetch]\nURI: ${this.mockup}${uri}\nError: ${e}`,
        );
        throw e;
      });

    this.loadingCache[uri] = promise;
    return promise;
  }

  /**
   * PUT or PATCH a redfish resource.
   * Return a promise containing a Response object.
   * @param uriArg - the URI to PUT/PATCH.
   * @param data - the JSON object to PUT/PATCH with.
   * @param method - "PUT" or "PATCH"
   */
  putOrPatch(uri, data, method) {
    return fetch(`${this.mockup}${uri}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.session ? this.session.token : null}`,
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: JSON.stringify(data),
    }).then((res) => {
      this.checkSessionLoss(res);
      if (!res.ok) {
        return res;
      }
      // We want to get the JSON response to update our cache.
      // But the consumer of this result may not care for that...
      // So we'll asynchronously go ahead and get the JSON, process it,
      // then create/return a new promise to mimic a fetch promise that
      // hasn't read the response body yet.
      return res
        .json()
        .then((json) => {
          res.json = () =>
            new Promise((resolve) => {
              resolve(json);
            });
          return new Promise((resolve) => {
            resolve(res);
          });
        })
        .catch((err) => {
          console.error(err);
          res.json = () =>
            new Promise(() => {
              throw err;
            });
          return new Promise((resolve) => {
            resolve(res);
          });
        });
    });
  }

  /**
   * Call this when done loading a URI from the RMC to our cache.
   */
  doneLoading(uri) {
    delete this.loadingCache[uri];
    this.resolveFetchWaiter();
  }

  /**
   * Call this to notify clients that all pending gets are done, if true.
   */
  resolveFetchWaiter = () => {
    if (this.fetchWaiterResolver !== null) {
      if (Object.keys(this.loadingCache).length === 0) {
        const resolver = this.fetchWaiterResolver;
        this.fetchWaiterResolver = null;
        setTimeout(() => resolver());
      }
    }
  };

  /**
   * Handle a new event from the EventSource SSE connection.
   * @param evt - the event generated by EventSource.
   */
  handleSseEvent = (evt) => {
    const data = JSON.parse(evt.data);
    data.Events.forEach((redfishEvent) => {
      this.handleRedfishEvent(redfishEvent);
      this.eventChannel.postMessage({ redfishEvent, id: TAB_ID });
    });
  };

  /**
   * Handle a received redfish event. Update cache and notify monitors.
   * @param evt - Redfish event JSON object.
   */
  handleRedfishEvent = (evt) => {
    // Catch exceptions below, otherwise an exception will be interpreted as an
    // event failure and call onEventFailure().
    try {
      const uri = evt.OriginOfCondition['@odata.id'];
      if (evt.MessageId.split('.')[3] === 'ResourceRemoved') {
        if (
          this.session &&
          (uri === this.session.uri ||
            uri ===
            `/redfish/v1/AccountService/Accounts/${this.session.username}`)
        ) {
          // Our session or account has expired or been deleted.
          this.sessionExpired();
        } else {
          this.rmFromResourceCache(uri);
        }
      } else {
        this.addToResourceCache(uri, evt.OriginOfCondition);
      }
      this.onEvent(evt);
    } catch (err) {
      console.error('handleRedfishEvent error', { err, evt });
    }
  };

  /**
   * Handle loss or expiration of our session in any fetch response.
   * @param res - fetch's Response object.
   */
  checkSessionLoss(res) {
    if (res.status === 401) {
      this.sessionExpired();
    }
  }

  /**
   * Delete our cached session and event connection.
   */
  rmSession = () => {
    config.sessionStorage.removeItem('redfish-session-token');
    config.sessionStorage.removeItem('redfish-session-uri');
    config.sessionStorage.removeItem('redfish-session-user');
    config.sessionStorage.removeItem('redfish-session-role');
    this.resourceCache = {};
    this.loadingCache = {};
    this.eventsFailed = false;
    // if (window.localStorage.getItem('sse-owner') === TAB_ID) {
    //   window.localStorage.removeItem('sse-owner');
    // }
    // if (this.events) {
    //   this.events.close();
    // }
  };

  /**
   * Get body of a cached resource, if we have it. Else returns null.
   */
  getCachedBody = (uri) =>
    uri in this.resourceCache ? this.resourceCache[uri].body : null;

  /**
   * For a new or updated URI, notify any applicable RedfishMonitors.
   * @param uri - URI of resource that has been discovered or updated.
   */
  doMonitorCallbacksForUri = (uri) => {
    this.monitors.forEach((monitor) => {
      if (monitor.uris.includes(uri)) {
        const resources = {};
        monitor.uris.forEach((monitoredUri) => {
          resources[monitoredUri] = this.getCachedBody(monitoredUri);
        });
        monitor.callback(resources);
      }
    });
  };

  /**
   * Remove a deleted resource from our cache. Notify RedfishMonitors.
   * @param uriArg - The URI of the removed resource.
   */
  rmFromResourceCache = (uriArg) => {
    const uri = uriArg.replace(/\/$/, '');
    [uri, this.getExpandedUri(uri)].forEach((u) => {
      if (u in this.resourceCache) {
        delete this.resourceCache[u];
        this.doMonitorCallbacksForUri(u);
      }
    });
  };

  /**
   * Add a new or updated resource to our cache. Notify RedfishMonitors.
   * @param uri - The URI of the new or updated resource.
   * @param resource - The redfish resource JSON object.
   * @param etag - The etag from the HTTP header when getting this resource.
   */
  addToResourceCache = (uri, resource, etag = null) => {
    if (etag == null && !uri.includes('?') && '@odata.etag' in resource) {
      // We can determine the etag from the body of the resource
      etag = resource['@odata.etag'];
    }

    this.resourceCache[uri] = {
      body: resource,
      etag,
    };
    this.doMonitorCallbacksForUri(uri);
  };

  /**
   * Return the expanded and nonexpanded URI of a URI parent, using $expand=*.
   * @param uri - The URI.
   */
  getParentUris = (uri) => {
    const collectionUri = this.getParentUri(uri);
    return [collectionUri, this.getExpandedUri(collectionUri)];
  };

  /**
   * Return the parent URI of a URI, meaning the resource that would include
   * this one if expanded.
   * @param uri - The URI.
   */
  getParentUri = (uri) => {
    // This function doesn't work for any generic URI, but just for the ones we
    // know we get through expansions. So it's sort of hackish, but doing this
    // the "right" way would lose some efficiency and require more thinking.
    return uri.slice(0, uri.lastIndexOf('/'));
  };

  /**
   * Return the expanded URI of a URI, using $expand=* notation.
   * @param uri - The URI.
   */
  getExpandedUri = (uri) => `${uri}?$expand=*`;

  /**
   * Turn URI into fetch args, including support for mockup if wanted.
   */
  getFetchArgs = (uri, useEtag) => {
    const headers = {
      // This is a common header to indicate an AJAX request to the server.
      // RMC should use this to remove the WWW-Authenticate header in its
      // response, since that generates browser sign-in pop-ups that we do
      // not want to occcur and can't otherwise stop the browser from doing.
      'X-Requested-With': 'XMLHttpRequest',
    };
    if (this.session) {
      headers['Authorization'] = `Bearer ${this.session.token}`;
    }
    if (useEtag && uri in this.resourceCache && this.resourceCache[uri].etag) {
      headers['If-None-Match'] = this.resourceCache[uri].etag;
    }
    return [
      `${this.mockup}${uri}`,
      {
        headers,
        // fetch with 'cors', when running: chrome --disable-web-security
        ...(this.mockup && { mode: 'cors' }),
      },
    ];
  };

  /**
   * Poll URIs for redfish monitors, due to event failure.
   */
  pollForMonitors = () => {
    this.monitors.forEach((monitor) => {
      if (monitor.poll) return; // already polling
      monitor.poll = setInterval(() => {
        monitor.uris.forEach((uri) => this.get(uri, false));
      }, POLL_INTERVAL);
    });
  };

  /**
   * For monitors that temporarily had to poll due to loss of events,
   * stop polling because now events are back.
   */
  stopTemporaryMonitorPolls = () => {
    this.monitors.forEach((monitor) => {
      if (monitor.forcePoll) return; // we want to poll this one regardless
      if (monitor.poll) {
        monitor.uris.forEach((uri) => this.get(uri, false));
        clearInterval(monitor.poll);
        monitor.poll = null;
      }
    });
  };

  initSession(token, username, email, role) {
    // Store in session storage
    config.sessionStorage.setItem('session-token', token);
    config.sessionStorage.setItem('session-uri', username);
    config.sessionStorage.setItem('session-user', email);
    config.sessionStorage.setItem('session-role', role);

    // Update client session
    this.session = {
      token,
      username,
      email,
      role
    };
  }

  /**
   * Do what it takes to start getting events. Either ensure another tab is the
   * "sseOwner" or start an SSE connection ourselves.
   */
  startEvents = () => {
    const sseOwner = window.localStorage.getItem('sse-owner');
    if (sseOwner !== TAB_ID) {
      // Another tab will already send us events via this.eventChannel
      this.useOtherSseOwner();
    } else {
      this.startSseConnection();
    }
  };

  useOtherSseOwner = () => {
    // Post message asking for the current SSE owner to identify themselves.
    // If nobody does soon, we'll try to take ownership.
    this.sseOwner = null;
    this.eventChannel.postMessage({ lookingForSseOwner: true, id: TAB_ID });
    this.sseOwnerTimer = setTimeout(this.tryToOwnSse, 3000);
  };

  /**
   * Start an SSE connection.
   */
  startSseConnection = () => {
    if (this.events?.readyState === EventSource.OPEN) {
      return;
    }

    // Open SSE connection to start receiving events.
    this.events = new EventSource('/redfish/v1/EventService/SSE', {
      headers: { 'Authorization': `Bearer ${this.session ? this.session.token : null}` },
    });
    window.localStorage.setItem('sse-owner', TAB_ID);
    this.eventChannel.postMessage({ iOwnSse: true, id: TAB_ID });

    this.events.onopen = () => {
      this.eventsFailed = false;
      this.stopTemporaryMonitorPolls();
      this.onEventSuccess();
    };
    this.events.onmessage = this.handleSseEvent;
    this.events.onerror = (err) => {
      if (!this.eventsFailed) {
        this.eventsFailed = true;
        this.pollForMonitors();
        this.onEventFailure(err);
      }
    };
  };

  /**
   * Handle message from another tab to the same host / broadcast domain.
   */
  handleEventChannelMessage = ({ data }) => {
    if (data.redfishEvent) {
      // Redfish event from a tab that has an SSE connection
      clearTimeout(this.sseOwnerTimer);
      if (!this.events) {
        this.sseOwner = data.id;
        this.handleRedfishEvent(data.redfishEvent);
      }
    } else if (data.iOwnSse) {
      // Another tab just opened an SSE connection
      clearTimeout(this.sseOwnerTimer);
      if (!this.events) {
        this.sseOwner = data.id;
      }
    } else if (data.lookingForSseOwner) {
      if (this.events) {
        this.eventChannel.postMessage({ iOwnSse: true, id: TAB_ID });
      }
    } else if (data.out) {
      // A tab is closing.
      if (data.id !== this.sseOwner) return;
      this.sseOwner = null;
      if (this.session) {
        // If SSE owner goes away and we have an active session, try to
        // become the new SSE owner.
        this.tryToOwnSse();
      }
    }
  };

  tryToOwnSse = () => {
    navigator.locks.request('sse', { ifAvailable: true }, (lock) => {
      if (!lock) {
        // Another tab got ownership first!
        // What if it closes before sending an event?
        this.useOtherSseOwner();
      } else {
        this.startSseConnection();
      }
    });
  };
}

export default AfoozoClient;
