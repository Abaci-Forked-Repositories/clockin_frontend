import useDeviceScreen from './useDeviceScreen';

const DEFAULT_BREAKPOINT = 768;

const useIsMobile = (breakpoint?: number) => {
	const deviceScreen = useDeviceScreen();
	const mobileBreakpoint =
		breakpoint ?? (Number(import.meta.env.VITE_API_MOBILE_BREAKPOINT_SIZE) || DEFAULT_BREAKPOINT);

	return deviceScreen?.width != null && deviceScreen.width <= mobileBreakpoint;
};

export default useIsMobile;
