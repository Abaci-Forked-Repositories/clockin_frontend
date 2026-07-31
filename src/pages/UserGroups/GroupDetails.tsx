import React from 'react';
import Card, { CardBody, CardHeader, CardLabel, CardTitle } from '../../components/bootstrap/Card';

/** Match `GroupMembersSection` card height on group detail page. */
const GROUP_DETAIL_CARD_HEIGHT_PX = 420;

const DetailRow = ({ label, value }: { label: string; value?: React.ReactNode }) => (
	<div className='py-1 border-bottom' style={{ paddingTop: '0.4rem', paddingBottom: '0.4rem' }}>
		<div
			className='text-muted small text-uppercase fw-semibold'
			style={{ fontSize: '0.75rem', letterSpacing: '0.02em', lineHeight: 1.25 }}>
			{label}
		</div>
		<div className='fw-semibold mt-1' style={{ fontSize: '0.95rem', wordBreak: 'break-word', lineHeight: 1.4 }}>
			{value != null && value !== '' ? value : '—'}
		</div>
	</div>
);

const formatSchedules = (group: any) => {
	const list = group?.schedules;
	if (!Array.isArray(list) || !list.length) return '';
	return list
		.map((s: any) => (typeof s === 'object' ? s?.name : null))
		.filter(Boolean)
		.join(', ');
};

const formatSites = (group: any) => {
	if (Array.isArray(group?.sites) && group.sites.length) {
		return group.sites
			.map((s: any) => (typeof s === 'object' ? s?.name : null))
			.filter(Boolean)
			.join(', ');
	}

	return (
		group?.site_details?.name ||
		group?.site_name ||
		(typeof group?.site === 'object' ? group.site?.name : null) ||
		''
	);
};

const GroupDetails = ({ group }: { group: any | null }) => {
	if (!group) return null;

	const parentName =
		group?.parent_group_details?.name ||
		group?.parent_group_data?.name ||
		group?.parent_group_name ||
		(typeof group?.parent_group === 'object' ? group.parent_group?.name : null);

	const leadOne =
		group?.lead_one_details?.preferred_name ||
		group?.lead_one_details?.name ||
		group?.lead_one_name ||
		(typeof group?.lead_one === 'object'
			? `${group.lead_one?.first_name || ''} ${group.lead_one?.last_name || ''}`.trim() ||
				group.lead_one?.email
			: null);

	const leadTwo =
		group?.lead_two_details?.preferred_name ||
		group?.lead_two_details?.name ||
		group?.lead_two_name ||
		(typeof group?.lead_two === 'object'
			? `${group.lead_two?.first_name || ''} ${group.lead_two?.last_name || ''}`.trim() ||
				group.lead_two?.email
			: null);

	return (
		<div className='w-100 h-100'>
			<Card
				className='w-100 h-100 d-flex flex-column overflow-hidden'
				style={{
					height: GROUP_DETAIL_CARD_HEIGHT_PX,
					maxHeight: GROUP_DETAIL_CARD_HEIGHT_PX,
				}}>
				<CardHeader className='flex-shrink-0 py-2'>
					<CardLabel icon='Info' iconColor='warning'>
						<CardTitle tag='div' className='h5 text-warning mb-0'>
							{group?.name || 'Group'}
						</CardTitle>
					</CardLabel>
				</CardHeader>
				<CardBody
					className='flex-grow-1 pt-0 pb-2 overflow-auto d-flex flex-column'
					style={{ minHeight: 0 }}>
					<DetailRow label='Type' value={group?.type} />
					<DetailRow
						label='Priority'
						value={
							group?.priority_choice_number != null &&
							String(group.priority_choice_number).trim() !== ''
								? String(group.priority_choice_number)
								: undefined
						}
					/>
					<DetailRow label='Parent group' value={parentName} />
					<DetailRow label='Primary Contact' value={leadOne} />
					<DetailRow label='Secondary Contact' value={leadTwo} />
					<DetailRow label='Sites' value={formatSites(group)} />
					<DetailRow label='Schedules' value={formatSchedules(group)} />
				</CardBody>
			</Card>
		</div>
	);
};

export default GroupDetails;
