import React, { useRef, useState } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import { CardTitle } from '../../components/bootstrap/Card';
import Page from '../../layout/Page/Page';
import AddButton from '../../components/CustomComponent/Buttons/AddButton';
import AddAssetType from './AssetType/AddAssetType';
import AssetTypes from './AssetType/AssetTypes';

const AssetTypesPage = () => {
	const tableRef = useRef(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [editId, setEditId] = useState<any>(null);

	const openAddModal = () => {
		setEditId(null);
		setIsFormOpen(true);
	};

	const editModalToggle = (id: any) => {
		setEditId(id);
		setIsFormOpen(true);
	};

	const closeForm = (open: boolean) => {
		if (!open) setEditId(null);
		setIsFormOpen(open);
	};

	return (
		<>
			{isFormOpen && (
				<AddAssetType
					isOpen={isFormOpen}
					setIsOpen={closeForm}
					tableRef={tableRef}
					title={editId ? 'Edit Asset Type' : 'Add Asset Type'}
					id={editId}
				/>
			)}
			<PageWrapper title='Asset Types'>
				<SubHeader>
					<SubHeaderLeft>
						<CardTitle tag='div' className='h5'>
							Asset Types
						</CardTitle>
					</SubHeaderLeft>
					<SubHeaderRight>
						<AddButton name='Add Asset Type' modalShow={openAddModal} />
					</SubHeaderRight>
				</SubHeader>
				<Page container='fluid'>
					<AssetTypes tableRef={tableRef} editModalToggle={editModalToggle} />
				</Page>
			</PageWrapper>
		</>
	);
};

export default AssetTypesPage;
