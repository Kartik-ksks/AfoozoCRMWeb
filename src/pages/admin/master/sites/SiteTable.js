import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Data,
    DataFilter,
    DataFilters,
    DataSearch,
    DataSummary,
    DataTableColumns,
    Grid,
    Heading,
    Toolbar,
    Menu,
    Layer,
} from 'grommet';
import { Add, More, Edit, Trash } from 'grommet-icons';

import { SessionContext, useMonitor } from '../../../../context/session';
import AddSite from './AddSite';
import EditSite from './EditSite';

import {
    FilteredDataTable,
    DataTableGroups,
    LoadingLayer,
    ConfirmOperation
} from '../../../../components';
import { naturalSort } from '../../../../Utils';


const SiteTable = ({ title, uri }) => {
    const { client } = useContext(SessionContext);
    const [data, setData] = useState();
    const [columns, setColumns] = useState();
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState();
    const [properties, setProperties] = useState();
    const [showAdd, setShowAdd] = useState(false);
    const [editSite, setEditSite] = useState(null);
    const [deleteSite, setDeleteSite] = useState(null);
    const [groupBy, setGroupBy] = useState();
    const [showEditLayer, setShowEditLayer] = useState(false);

    useMonitor(
        client,
        [uri],
        ({ [uri]: collection }) => {
            if (!collection) return;
            setLoading(false);
            // Sort collection by SiteId
            const sortedData = naturalSort(collection, (item) => item.SiteId);
            setData(sortedData);

            const renderProperty = (datum, key) => {
                switch (key) {
                    case 'IsActive':
                        return datum[key] === 1 ? 'Active' : 'Inactive';
                    default:
                        return datum[key];
                }
            };

            const dataProperties = {
                SiteId: { label: 'ID', search: true },
                SiteName: { label: 'Site Name', search: true },
                CategoryId: { label: 'Site Type', search: true },
                DisplayOrderNo: { label: 'Display Order No', search: true },
                Details: { label: 'Details', search: true },
                ContactPerson: { label: 'Contact Person', search: true },
                IsActive: { label: 'Status', search: true },
            };
            setProperties(dataProperties);

            const cols = [
                { property: 'SiteId', header: 'ID', primary: true },
                { property: 'SiteName', header: 'Site Name' },
                { property: 'CategoryId', header: 'Site Type' },
                { property: 'DisplayOrderNo', header: 'Display Order No' },
                { property: 'Details', header: 'Details' },
                { property: 'ContactPerson', header: 'Contact Person' },
                { property: 'IsActive', header: 'Status' },
                {
                    property: 'actions',
                    header: 'Actions',
                    render: (datum) => (
                        <Menu
                            icon={<More />}
                            hoverIndicator
                            items={[
                                {
                                    label: 'Edit',
                                    icon: <Edit />,
                                    onClick: () => {
                                        setEditSite(datum);
                                        setShowEditLayer(true);
                                    },
                                },
                                {
                                    label: 'Delete',
                                    icon: <Trash />,
                                    onClick: () => setDeleteSite(datum),
                                }
                            ]}
                        />
                    ),
                }
            ].map(col => ({
                ...col,
                render: col.property === 'actions' ?
                    col.render :
                    (datum) => renderProperty(datum, col.property),
            }));

            setColumns(cols);
            setOptions(cols.filter(col => col.property !== 'actions').map(({ property, header }) => ({
                property,
                label: header,
            })));
        },
        [
            setData,
            setLoading,
            setColumns,
            setOptions,
            setProperties
        ]
    );

    return (
        <Box fill overflow={{ vertical: 'scroll' }} pad="small" gap="large">
            {loading && <LoadingLayer />}
            <Box>
                <Box
                    direction="row"
                    align="center"
                    justify="between"
                    gap="small"
                    margin={{ top: 'medium', bottom: 'large' }}
                >
                    <Heading id='idSites-table' level={2}>
                        {title}
                    </Heading>
                    <Button
                        primary
                        icon={<Add />}
                        label="Add Site"
                        color="status-critical"
                        onClick={() => setShowAdd(true)}
                    />
                </Box>
            </Box>

            {data && (
                <Box>
                    <Grid height={{ min: 'medium' }}>
                        <Data data={data} properties={properties}>
                            <Toolbar align="center" gap="medium">
                                <DataSearch responsive placeholder="Search sites" />
                                <DataTableGroups
                                    groups={options?.filter(
                                        (option) => ['SiteName', 'IsActive'].includes(option.property)
                                    )}
                                    setGroupBy={setGroupBy}
                                />
                                <DataTableColumns
                                    drop
                                    tip="Configure columns"
                                    options={options}
                                />
                                <DataFilters layer>
                                    <DataFilter property="SiteId" />
                                    <DataFilter property="SiteName" />
                                    <DataFilter property="CategoryId" />
                                    <DataFilter property="IsActive" options={[
                                        { label: 'Active', value: 1 },
                                        { label: 'Inactive', value: 0 },
                                    ]} />
                                </DataFilters>
                            </Toolbar>
                            <FilteredDataTable
                                describedBy='idSites-table'
                                columns={columns}
                                groupBy={groupBy}
                            />
                        </Data>
                    </Grid>
                </Box>
            )}

            {showAdd && (
                <AddSite
                    onClose={() => setShowAdd(false)}
                    onSave={() => {
                        setShowAdd(false);
                    }}
                />
            )}

            {showEditLayer && editSite && (
                <EditSite
                    site={editSite}
                    onClose={() => setShowEditLayer(false)}
                    onSave={() => {
                        setEditSite(null);
                        setShowEditLayer(false);
                    }}
                />
            )}

            {deleteSite && (
                <ConfirmOperation
                    title="Delete Site"
                    text={`Are you sure you want to delete ${deleteSite.SiteName}?`}
                    onClose={() => setDeleteSite(null)}
                    onConfirm={() => client.delete(`${uri}/${deleteSite.SiteId}`)}
                    yesPrompt="Yes, Delete"
                    noPrompt="Cancel"
                    estimatedTime={5}
                    onSuccess={() => setDeleteSite(null)}
                />
            )}
        </Box>
    );
};

SiteTable.propTypes = {
    title: PropTypes.string,
    uri: PropTypes.string.isRequired,
};

export default SiteTable;
