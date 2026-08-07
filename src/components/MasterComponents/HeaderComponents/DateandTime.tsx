import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { Calendar as DatePicker } from 'react-date-range';

import Icon from '../../icon/Icon';
import Popovers from '../../bootstrap/customPopoverForDateRange';

const DateAndTimeComponent = () => {
	const [currentTime, setCurrentTime] = useState(new Date());

	useEffect(() => {
		const intervalId = setInterval(() => {
			setCurrentTime(new Date());
		}, 1000);

		return () => clearInterval(intervalId);
	}, []);

	const dayOfMonth = currentTime.getDate();
	const year = currentTime.getFullYear();
	const monthAsString = currentTime.toLocaleString('default', { month: 'long' });
	const dayOfWeek = currentTime.getDay();
	const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
	const dayName = days[dayOfWeek];

	return (
		<div
			className='header-toolbar-pill'
			style={{
				width: 'auto',
				minWidth: dayName === 'WEDNESDAY' ? '240px' : '230px',
				backgroundColor: '#FAC600',
				userSelect: 'none',
				flexShrink: 0,
			}}>
			<Icon size='lg' icon='AccessTime' className='clock_icon_style' color='dark' />
			<p
				style={{
					margin: 0,
					color: 'black',
					fontSize: '11px',
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}>
				{moment(currentTime).format('LT')}
			</p>
			<p
				style={{
					margin: 0,
					color: 'black',
					fontSize: '11px',
					lineHeight: 1,
					whiteSpace: 'nowrap',
				}}>{`${dayOfMonth}  ${monthAsString}  ${year}  ${dayName}`}</p>
		</div>
	);
};

export default DateAndTimeComponent;
