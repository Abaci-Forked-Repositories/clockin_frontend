import React, { useContext, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
} from '../../layout/SubHeader/SubHeader';
import Card, {
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../components/bootstrap/Card';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import UserGroupsTableComponent from './UserGroupsTableComponent';
import BulkUpload from '../../components/MasterComponents/BulkUpload/BulkUploadOffCanvas';
import AddButton from '../../components/CustomComponent/Buttons/AddButton';
import usePermissionHook from '../../hooks/userPermissionHook';
import AuthContext from '../../contexts/authContext';
import ButtonFiltter from '../../components/CustomComponent/Filters/ButtonFiltter';
import AddGroup from './AddGroup';
import { isAdminOrHrToggleMode } from '../../helpers/roleToggleUtils';

const Index = () => {

	const tableRef = useRef();
	const urlBackup = useRef();
	const [addModalShow, setAddModalShow] = useState(false);
	const [addBulkModalShow, setAddBulkModalShow] = useState(false);
	const [editId, setEditId] = useState<any>(null);
	const {userData}=useContext(AuthContext)
	const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
	const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
	const canAddOrEditGroups = isAdminOrHrToggleMode(userData, mode);
	const tenant = userData?.active_relations?.[0]?.tenant_details || null;
	const [activeTab, setActiveTab] = useState('All')
	const FilterStatus = ['All', tenant ? tenant?.tenant_name : '']
	const canSeeTenantFilter=usePermissionHook('view_tenant_filter');	
	const editModalToggle = (id: any) => {
		if (!canAddOrEditGroups) return;
		setEditId(id);
		setAddModalShow(true);
	}

	const openAddModal = (state: boolean) => {
		if (state && !canAddOrEditGroups) return;
		if (state) setEditId(null);
		setAddModalShow(state);
	};


	return (
		<>
			{addModalShow && (
				<AddGroup
					isOpen={addModalShow}
					setIsOpen={setAddModalShow}
					tableRef={tableRef}
					title={editId ? 'Edit Group' : 'Add Group'}
					id={editId}
				/>
			)}
			{addBulkModalShow && (
				<BulkUpload
					isOpen={addBulkModalShow}
					setIsOpen={setAddBulkModalShow}
					tableRef={tableRef}
					title='Bulk Upload'
					api='api/hr/groups/group_csv_import_and_sample_csv_download/'
					fileName='Groups.csv'

				/>
			)}

			<PageWrapper title='User Groups'>
				<SubHeader>
					<SubHeaderLeft>
						<CardTitle tag='div' className='h5'>
							Groups
						</CardTitle>

					</SubHeaderLeft>
					<SubHeaderRight>
						{canAddOrEditGroups ? (
							<AddButton modalShow={openAddModal} name='Add Group' />
						) : null}
					</SubHeaderRight>
				</SubHeader>
				<Card stretch>
					<CardHeader borderSize={1}>
						<CardLabel icon='' iconColor='info'>
							<CardTitle tag='div' className='h5' ><p /></CardTitle>
						</CardLabel>
					</CardHeader>
					<CardBody className='table-responsive'><p />
					{tenant && canSeeTenantFilter && <ButtonFiltter
							FilterStatus={FilterStatus}
							activeTab={activeTab}
							setActiveTab={setActiveTab}
							styles={{ top: '100px' }}
						/>}
						<UserGroupsTableComponent
							tableRef={tableRef}
							urlBackup={urlBackup}
							editModalToggle={editModalToggle}
						/>
					</CardBody>
				</Card>
			</PageWrapper>
		</>
	);
};

export default Index;
