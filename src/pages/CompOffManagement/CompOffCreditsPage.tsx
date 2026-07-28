import React, { useRef, useState } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft, SubHeaderRight } from '../../layout/SubHeader/SubHeader';
import Card, { CardTitle } from '../../components/bootstrap/Card';
import Page from '../../layout/Page/Page';
import AddButton from '../../components/CustomComponent/Buttons/AddButton';
import AddCompOffCredit from './CompOffCredit/AddCompOffCredit';
import CompOffCredits from './CompOffCredit/CompOffCredits';

const CompOffCreditsPage = () => {
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
				<AddCompOffCredit
					isOpen={isFormOpen}
					setIsOpen={closeForm}
					tableRef={tableRef}
					title={editId ? 'Edit Comp Off Credit' : 'Add Comp Off Credit'}
					id={editId}
				/>
			)}
			<PageWrapper title='Comp Off Credits'>
				<SubHeader>
					<SubHeaderLeft>
						<CardTitle tag='div' className='h5'>
							Comp Off Credits
						</CardTitle>
					</SubHeaderLeft>
					<SubHeaderRight>
						<AddButton name='Add Comp Off' modalShow={openAddModal} />
					</SubHeaderRight>
				</SubHeader>
				<Page container='fluid'>
					<CompOffCredits tableRef={tableRef} editModalToggle={editModalToggle} />
				</Page>
			</PageWrapper>
		</>
	);
};

export default CompOffCreditsPage;
