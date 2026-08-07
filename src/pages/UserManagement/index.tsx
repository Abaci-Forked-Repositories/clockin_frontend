import React, { useContext, useRef, useState } from 'react';
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
import AddUsers from './AddUsers';
import EditUser from './EditUser';
import UserManagementTableComponent from '../../components/MasterComponents/Usermanagement/UserMangementTableComponent';
import BulkUpload from '../../components/MasterComponents/BulkUpload/BulkUploadOffCanvas';
import ButtonWithPopover from '../../components/CustomComponent/Buttons/ButtonWithPopover';
import usePermissionHook from '../../hooks/userPermissionHook';
import AuthContext from '../../contexts/authContext';
import ButtonFiltter from '../../components/CustomComponent/Filters/ButtonFiltter';
import { useSelector } from 'react-redux';
import { isAdminOrHrToggleMode } from '../../helpers/roleToggleUtils';

export type UserCrudModel = {
	email: string;
	first_name: string;
	last_name: string;
	gender: string;
	dob: string;
	joined_date?: string;
	address: string;
	state: string;
	city: string;
	pincode: string;
	country: string;
	personal_contact_number: string;
	office_contact_number: string;
	is_tenant_admin?: boolean;
	is_hr?: boolean;
	is_manager?: boolean;
	group: number;
	site: number;
};

const Index = () => {

	const tableRef = useRef();
	const urlBackup = useRef();
	const [addModalShow, setAddModalShow] = useState(false);
	const [editModalShow, setEditModalShow] = useState(false);
	const [editUserId, setEditUserId] = useState<number | string | null>(null);
	const [addBulkModalShow, setAddBulkModalShow] = useState(false);
	const {userData}=useContext(AuthContext)
	const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
	const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
	const canAddOrEditUsers = isAdminOrHrToggleMode(userData, mode);
	const tenant = userData?.active_relations?.[0]?.tenant_details || null;
	const [activeTab, setActiveTab] = useState('All')
	const FilterStatus = ['All', tenant ? tenant?.tenant_name : '']
	const canSeeTenantFilter=usePermissionHook('view_tenant_filter');	
	const editModalToggle = (id: any) => {
		if (!canAddOrEditUsers) return;
		setEditUserId(id);
		setEditModalShow(true);
	};

	const closeEditModal = (open: boolean) => {
		if (!open) setEditUserId(null);
		setEditModalShow(open);
	};

	return (
		<>
			{addModalShow && (
				<AddUsers
					isOpen={addModalShow}
					setIsOpen={setAddModalShow}
					tableRef={tableRef}
					title='Add User'
				/>
			)}
			{editModalShow && editUserId != null && editUserId !== '' && (
				<EditUser
					isOpen={editModalShow}
					setIsOpen={closeEditModal}
					tableRef={tableRef}
					userId={editUserId}
					title='Edit User'
				/>
			)}
			{addBulkModalShow && (
				<BulkUpload
					isOpen={addBulkModalShow}
					setIsOpen={setAddBulkModalShow}
					tableRef={tableRef}
					title='Bulk Upload'
					api='/api/hr/users/import/'
					uploadApi='/api/hr/users/import/'
					templateApi='/api/hr/users/import-template/'
					instructionsApi='/api/hr/users/import-instructions/'
					instructionsFileName='User-Import-Instructions.txt'
					fileName='Users-Import-Template.xlsx'

				/>
			)}

			<PageWrapper title='Company Users'>
				<SubHeader>
					<SubHeaderLeft>
						<CardTitle tag='div' className='h5'>
							Company Users
						</CardTitle>

					</SubHeaderLeft>
					<SubHeaderRight>
						{canAddOrEditUsers ? (
							<ButtonWithPopover
								addModalShow={setAddModalShow}
								addBulkModalShow={setAddBulkModalShow}
								buttonName='Add User'
							/>
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
						<UserManagementTableComponent
							tableRef={tableRef}
							editModalToggle={editModalToggle}
							urlBackup={urlBackup}
							//@ts-ignore
							tenant={tenant}
							activeTab={activeTab}
						/>
					</CardBody>
				</Card>
			</PageWrapper>
		</>
	);
};

export default Index;
