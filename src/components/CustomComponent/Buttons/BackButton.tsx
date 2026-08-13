import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../bootstrap/Button';

type BackButtonProps = {
	/** Parent list path (detail pages). Used immediately unless preferHistory is set. */
	to?: string;
	/** Go to the previous in-app page first; `to` is only a fallback (e.g. Profile). */
	preferHistory?: boolean;
};

const BackButton = ({ to, preferHistory = false }: BackButtonProps) => {
	const navigate = useNavigate();
	const location = useLocation();
	const from = (location.state as { from?: string } | null)?.from;

	const handleClick = () => {
		if (from && from !== location.pathname) {
			navigate(from);
			return;
		}
		if (preferHistory && location.key !== 'default') {
			navigate(-1);
			return;
		}
		if (to) {
			navigate(to);
			return;
		}
		navigate(-1);
	};

	return (
		<Button size='sm' color='light' isLink icon='ArrowBack' onClick={handleClick}>
			Back
		</Button>
	);
};

export default BackButton;
