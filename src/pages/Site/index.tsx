import React, { useContext, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
// import Swal from 'sweetalert2';
import SubHeader, {
	SubHeaderLeft,
	SubHeaderRight,
} from '../../layout/SubHeader/SubHeader';
import Card, {
	CardActions,
	CardBody,
	CardHeader,
	CardLabel,
	CardTitle,
} from '../../components/bootstrap/Card';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import { useNavigate } from 'react-router-dom';
import AddButton from '../../components/CustomComponent/Buttons/AddButton';
import usePermissionHook from '../../hooks/userPermissionHook';
import AuthContext from '../../contexts/authContext';
import ButtonFiltter from '../../components/CustomComponent/Filters/ButtonFiltter';
import SiteManagementTableComponent from './SiteManagementTableComponent';
import AddSite from './AddSite';
import { isAdminOrHrToggleMode } from '../../helpers/roleToggleUtils';

const Index = () => {

	const tableRef = useRef();
	const urlBackup = useRef();
	const navigate = useNavigate();
	const [addModalShow, setAddModalShow] = useState(false);
	const [editId, setEditId] = useState<any>(null);
	const {userData}=useContext(AuthContext)
	const accountToggle = useSelector((state: any) => state.authSlice?.account_toggle_button);
	const mode = accountToggle === 'Self' ? 'Self' : 'Admin';
	const canAddOrEditSites = isAdminOrHrToggleMode(userData, mode);
	const tenant = userData?.active_relations?.[0]?.tenant_details || null;
	const [activeTab, setActiveTab] = useState('All')
	const FilterStatus = ['All', tenant ? tenant?.tenant_name : '']
	const canSeeTenantFilter=usePermissionHook('view_tenant_filter');	
	const editModalToggle = (id: any) => {
		if (!canAddOrEditSites) return;
		setEditId(id);
		setAddModalShow(true);
	}

	const openAddModal = (state: boolean) => {
		if (state && !canAddOrEditSites) return;
		if (state) setEditId(null);
		setAddModalShow(state);
	};


	return (
		<>
			{addModalShow && (
				<AddSite
					isOpen={addModalShow}
					setIsOpen={setAddModalShow}
					tableRef={tableRef}
					title={editId ? 'Edit Site' : 'Add Site'}
					id={editId}
				/>
			)}

			<PageWrapper title='Site Management'>
				<SubHeader>
					<SubHeaderLeft>
						<CardTitle tag='div' className='h5'>
							Site Management
						</CardTitle>

					</SubHeaderLeft>
					<SubHeaderRight>
						{canAddOrEditSites ? (
							<AddButton modalShow={openAddModal} name="Add Site" />
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
						<SiteManagementTableComponent
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
