import { useMemo } from 'react';
import useImageHandler from './useImageHandler';
import { isBase64Image, normalizeMediaPath, resolveUserAvatarSource } from '../helpers/functions';
import urlMaker from '../helpers/UrlMaker';

const useUserAvatarSrc = (user: unknown, fallback: string, mediaType = 'avatars') => {
	const rawSource = resolveUserAvatarSource(user);
	const isDataUrl = Boolean(rawSource && isBase64Image(rawSource));
	const mediaPath = isDataUrl ? null : normalizeMediaPath(rawSource);
	const { url: blobUrl, failed } = useImageHandler(mediaPath, mediaType);

	return useMemo(() => {
		if (isDataUrl && rawSource) return rawSource;
		if (blobUrl) return blobUrl;
		if (!rawSource || failed || mediaPath) return fallback;
		if (/^https?:\/\//i.test(String(rawSource))) return String(rawSource);
		return urlMaker(String(rawSource), mediaType) || fallback;
	}, [blobUrl, failed, fallback, isDataUrl, mediaPath, mediaType, rawSource]);
};

export default useUserAvatarSrc;
