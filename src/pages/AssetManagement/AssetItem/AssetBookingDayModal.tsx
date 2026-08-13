import React from 'react';
import dayjs from 'dayjs';
import Modal, {
	ModalBody,
	ModalFooter,
	ModalHeader,
	ModalTitle,
} from '../../../components/bootstrap/Modal';
import Button from '../../../components/bootstrap/Button';
import useDarkMode from '../../../hooks/useDarkMode';
import AssetBookingDayDetails from './AssetBookingDayDetails';
import type { AssetBooking } from './assetBookingCalendarUtils';

type AssetBookingDayModalProps = {
	isOpen: boolean;
	setIsOpen: (open: boolean) => void;
	selectedDate: Date | null;
	bookings: AssetBooking[];
	allowBooking?: boolean;
	onBook?: (date: Date | null) => void;
	onActionSuccess?: () => void;
	siteTimezoneIana?: string;
	siteTimezoneLabel?: string;
};

const AssetBookingDayModal = ({
	isOpen,
	setIsOpen,
	selectedDate,
	bookings,
	allowBooking = false,
	onBook,
	onActionSuccess,
	siteTimezoneIana,
	siteTimezoneLabel,
}: AssetBookingDayModalProps) => {
	const { darkModeStatus } = useDarkMode();
	const day = selectedDate ? dayjs(selectedDate) : null;
	const timezoneHint = siteTimezoneLabel || siteTimezoneIana;

	const surface = darkModeStatus ? 'rgba(255,255,255,0.04)' : '#f8fafc';
	const textPrimary = darkModeStatus ? '#f1f5f9' : '#0f172a';
	const textMuted = darkModeStatus ? '#94a3b8' : '#64748b';
	const accentSoft = darkModeStatus ? 'rgba(13,110,253,0.18)' : 'rgba(13,110,253,0.08)';

	return (
		<Modal
			isOpen={isOpen}
			setIsOpen={setIsOpen}
			size='lg'
			isCentered
			isScrollable
			isAnimation={false}>
			<ModalHeader setIsOpen={setIsOpen} className='border-0 pb-0 px-4 pt-4'>
				<ModalTitle id='asset-booking-day-modal' className='w-100'>
					<div className='d-flex align-items-center gap-3'>
						{day ? (
							<div
								className='d-flex flex-column align-items-center justify-content-center rounded-3'
								style={{
									width: 64,
									height: 64,
									background: accentSoft,
									color: '#0d6efd',
									flexShrink: 0,
								}}>
								<span
									style={{
										fontSize: '0.7rem',
										fontWeight: 700,
										letterSpacing: '0.08em',
										textTransform: 'uppercase',
										lineHeight: 1,
									}}>
									{day.format('MMM')}
								</span>
								<span style={{ fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.15 }}>
									{day.format('D')}
								</span>
							</div>
						) : null}
						<div className='min-w-0'>
							<div
								style={{
									fontSize: '1.2rem',
									fontWeight: 700,
									color: textPrimary,
									lineHeight: 1.25,
								}}>
								{day ? day.format('dddd') : 'Bookings'}
							</div>
							<div className='mt-1' style={{ color: textMuted, fontSize: '0.95rem' }}>
								{day ? day.format('D MMMM YYYY') : 'Selected day'}
								{bookings.length > 0
									? ` · ${bookings.length} booking${bookings.length === 1 ? '' : 's'}`
									: ' · Free'}
								{timezoneHint ? ` · ${timezoneHint}` : ''}
							</div>
						</div>
					</div>
				</ModalTitle>
			</ModalHeader>

			<ModalBody
				className='px-4 pt-4 pb-4'
				style={{
					maxHeight: '72vh',
					overflowY: 'auto',
					background: surface,
					minHeight: bookings.length === 0 ? 280 : 320,
				}}>
				<AssetBookingDayDetails
					bookings={bookings}
					allowBooking={allowBooking}
					onActionSuccess={onActionSuccess}
					siteTimezoneIana={siteTimezoneIana}
					siteTimezoneLabel={siteTimezoneLabel}
				/>
			</ModalBody>

			{allowBooking ? (
				<ModalFooter
					className='border-0 px-4 pb-4 pt-2'
					style={{ background: surface }}>
					<Button
						color='info'
						className='w-100'
						size='lg'
						icon='EventAvailable'
						onClick={() => {
							setIsOpen(false);
							onBook?.(selectedDate);
						}}>
						Book this asset
					</Button>
				</ModalFooter>
			) : null}
		</Modal>
	);
};

export default AssetBookingDayModal;
