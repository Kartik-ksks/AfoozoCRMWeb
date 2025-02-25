import React, { useContext, useState } from 'react';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
    Text,
    Heading,
    TextInput,
} from 'grommet';
import { UserSettings } from 'grommet-icons';
import { SessionContext, useMonitor } from '../../../context/session';
import { ConfirmOperation, CoverPage, LoadingLayer, Tile, TileBox } from '../../../components';

const Accounts = () => {
    const { client } = useContext(SessionContext);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editPassword, setEditPassword] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [sites, setSites] = useState([]);

    useMonitor(
        client,
        ['/api/auth/me'],
        ({ ['/api/auth/me']: user }) => {
            if (user) {
                setUserData(user);
                setLoading(false);
            }
        }
    );

    useMonitor(
        client,
        ['/api/sites'],
        ({ ['/api/sites']: sites }) => {
            if (sites) {
                setSites(sites);
                setLoading(false);
            }
        }
    );

    const renderUserDetails = () => (
        <Tile
            title="Accounts Details"
            footer={
                <Button
                    pad="small"
                    primary
                    color="status-critical"
                    icon={<UserSettings />}
                    label="Change Password"
                    onClick={() => setEditPassword(true)}

                />
            }
        >
            <Box pad="small">
                <Table pad="small">
                    <TableHeader>
                        <TableRow>
                            <TableCell scope="col">Field</TableCell>
                            <TableCell scope="col">Value</TableCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow>
                            <TableCell scope="row">Username</TableCell>
                            <TableCell>{userData?.Username}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell scope="row">Email</TableCell>
                            <TableCell>{userData?.Email}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell scope="row">Role</TableCell>
                            <TableCell>{userData?.Role}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell scope="row">Status</TableCell>
                            <TableCell>{userData?.IsActive === 1 ? 'Active' : 'Inactive'}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell scope="row">Created Date</TableCell>
                            <TableCell>
                                {userData?.CreatedDate && new Date(userData.CreatedDate).toLocaleString()}
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell scope="row">Last Login</TableCell>
                            <TableCell>
                                {userData?.LastLoginTimestamp && new Date(userData.LastLoginTimestamp).toLocaleString()}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                {userData?.SiteIds?.length > 0 && (
                    <Box margin={{ top: 'medium' }}>
                        <Heading level={4} margin={{ vertical: 'small' }}>Assigned Sites</Heading>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableCell scope="col">Site Name</TableCell>
                                    <TableCell scope="col">Category</TableCell>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sites?.map(site => (
                                    <TableRow key={site.SiteId}>
                                        <TableCell>{site.SiteName}</TableCell>
                                        <TableCell>{site.CategoryId}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Box>
                )}
            </Box>
        </Tile>
    );


    return (
        <CoverPage title="Accounts" icon={<UserSettings />} >
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
                        <Heading level={2}>Accounts</Heading>
                    </Box>
                </Box>
                <TileBox title="Accounts" icon={<UserSettings />} >
                    {loading && <LoadingLayer />}
                    <Box width="large">
                        {userData && renderUserDetails()}
                    </Box>

                    {editPassword && (
                        <ConfirmOperation
                            title="Change Password"
                            text={
                                <Box gap="medium">
                                    <Text>Enter your new password:</Text>
                                    <TextInput
                                        type="password"
                                        placeholder="New password"
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                    />
                                </Box>
                            }
                            onConfirm={() => client.put('/api/auth/password', { Password: newPassword })}
                            onClose={() => {
                                setEditPassword(false);
                                setNewPassword('');
                            }}
                            yesPrompt="Change Password"
                            noPrompt="Cancel"
                            estimatedTime={5}
                            onSuccess={() => setLoading(true)}
                        />
                    )}
                </TileBox>
            </Box>
        </CoverPage>
    );
};


export default Accounts;