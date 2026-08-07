import React, { useRef } from 'react';
import PageWrapper from '../../layout/PageWrapper/PageWrapper';
import SubHeader, { SubHeaderLeft } from '../../layout/SubHeader/SubHeader';
import { CardTitle } from '../../components/bootstrap/Card';
import Page from '../../layout/Page/Page';
import BookAssetsList from './BookAsset/BookAssetsList';

const BookAssetPage = () => {
	const tableRef = useRef(null);

	return (
		<PageWrapper title='Book Asset'>
			<SubHeader>
				<SubHeaderLeft>
					<CardTitle tag='div' className='h5'>
						Book Asset
					</CardTitle>
				</SubHeaderLeft>
			</SubHeader>
			<Page container='fluid'>
				<BookAssetsList tableRef={tableRef} />
			</Page>
		</PageWrapper>
	);
};

export default BookAssetPage;
