import React, { useRef, useState } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import { CardTitle } from '../../components/bootstrap/Card';
import Page from '../../layout/Page/Page';
import AddButton from '../../components/CustomComponent/Buttons/AddButton';
import AddAssetItem from './AssetItem/AddAssetItem';
import AssetItems from './AssetItem/AssetItems';

const AssetsPage = () => {
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
				<AddAssetItem
					isOpen={isFormOpen}
					setIsOpen={closeForm}
					tableRef={tableRef}
					title={editId ? 'Edit Asset' : 'Add Asset'}
					id={editId}
				/>
			)}
			<PageWrapper title='Assets'>
				<SubHeader>
					<SubHeaderLeft>
						<CardTitle tag='div' className='h5'>
							Assets
						</CardTitle>
					</SubHeaderLeft>
					<SubHeaderRight>
						<AddButton name='Add Asset' modalShow={openAddModal} />
					</SubHeaderRight>
				</SubHeader>
				<Page container='fluid'>
					<AssetItems tableRef={tableRef} editModalToggle={editModalToggle} />
				</Page>
			</PageWrapper>
		</>
	);
};

export default AssetsPage;
