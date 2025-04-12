import React, { useContext, useState } from 'react';
import PropTypes from 'prop-types';
import {
    Box,
    Button,
    Data,
    DataFilter,
    DataFilters,
    DataSearch,
    DataTableColumns,
    Grid,
    Heading,
    Toolbar,
    Menu,
} from 'grommet';
import { Add, More, Edit, Trash } from 'grommet-icons';

import { CoverPage, LoadingLayer, TileBox, Tile } from '../../../../components';
import { SessionContext, useMonitor } from '../../../../context/session';
import { FilteredDataTable, DataTableGroups } from '../../../../components/dataTable';
import AddCategory from './AddCategory';
import EditCategory from './EditCategory';
import { ConfirmOperation } from '../../../../components';
import { naturalSort } from '../../../../Utils';

const uri = '/api/site-categories';
const CategoryTable = ({ title }) => {
    const { client } = useContext(SessionContext);
    const [data, setData] = useState();
    const [columns, setColumns] = useState();
    const [loading, setLoading] = useState(true);
    const [options, setOptions] = useState();
    const [properties, setProperties] = useState();
    const [showAdd, setShowAdd] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [deleteCategory, setDeleteCategory] = useState(null);
    const [groupBy, setGroupBy] = useState();

    useMonitor(
        client,
        [uri],
        ({ [uri]: collection }) => {
            if (!collection) return;
            setLoading(false);

            // Sort collection by CategoryId
            const sortedData = naturalSort(collection, (item) => item.CategoryId);
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
                CategoryId: { label: 'ID', search: true },
                CategoryName: { label: 'Name', search: true, options: ['Name'] },
                Description: { label: 'Description', search: true },
                IsActive: {
                    label: 'Status',
                    search: true,
                    options: ['Active', 'Inactive']
                },
            };
            setProperties(dataProperties);

            const cols = [
                { property: 'CategoryId', header: 'ID', primary: true },
                { property: 'CategoryName', header: 'Name' },
                { property: 'Description', header: 'Description' },
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
                                    onClick: () => setEditCategory(datum),
                                },
                                {
                                    label: 'Delete',
                                    icon: <Trash />,
                                    onClick: () => setDeleteCategory(datum),
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

    const id = title.replaceAll(' ', '-');

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
                    <Heading id={id} level={2}>
                        {title}
                    </Heading>
                    <Button
                        primary
                        color="status-critical"
                        icon={<Add />}
                        label="Add Category"
                        onClick={() => setShowAdd(true)}
                    />
                </Box>
            </Box>

            {data && (
                <Box>
                    <Grid height={{ min: 'medium' }}>
                        <Data data={data} properties={properties}>
                            <Toolbar align="center" gap="medium">
                                <DataSearch responsive placeholder="Search categories" />
                                <DataTableGroups
                                    groups={options?.filter(
                                        (option) => ['CategoryName', 'IsActive'].includes(option.property)
                                    )}
                                    setGroupBy={setGroupBy}
                                />
                                <DataTableColumns
                                    drop
                                    tip="Configure columns"
                                    options={options}
                                />
                                <DataFilters layer>
                                    <DataFilter property="CategoryId" />
                                    <DataFilter property="CategoryName" />
                                    <DataFilter property="Description" />
                                    <DataFilter property="IsActive" options={[
                                        { label: 'Active', value: 1 },
                                        { label: 'Inactive', value: 0 },
                                    ]} />
                                </DataFilters>
                            </Toolbar>
                            <FilteredDataTable
                                describedBy={id}
                                columns={columns}
                                groupBy={groupBy}
                            />
                        </Data>
                    </Grid>
                </Box>
            )}

            {showAdd && (
                <AddCategory
                    onClose={() => setShowAdd(false)}
                    onSave={() => {
                        setShowAdd(false);
                    }}
                />
            )}

            {editCategory && (
                <EditCategory
                    category={editCategory}
                    onClose={() => setEditCategory(null)}
                    onSave={() => {
                        setEditCategory(null);
                    }}
                />
            )}

            {deleteCategory && (
                <ConfirmOperation
                    title="Delete Category"
                    text={`Are you sure you want to delete ${deleteCategory.CategoryName}?`}
                    onClose={() => setDeleteCategory(null)}
                    onConfirm={() => client.delete(`${uri}/${deleteCategory.CategoryId}`)}
                    yesPrompt="yes, Delete"
                    noPrompt="Cancel"
                    estimatedTime={5}
                    onSuccess={() => setDeleteCategory(null)}
                    progressLabel={`Deleting category ${deleteCategory.CategoryName}...`}
                />
            )}
        </Box>
    );
};

CategoryTable.propTypes = {
    title: PropTypes.string,
};

export default CategoryTable;
