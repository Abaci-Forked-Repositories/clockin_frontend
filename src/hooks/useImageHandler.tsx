// useImageHandler.ts
import { useEffect, useState } from 'react';
import { authAxios } from '../axiosInstance';
import { baseURL } from '../helpers/baseURL';

const useImageHandler = (image, type = 'default') => {
	const [imageUrl, setImageUrl] = useState(null);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		if (!image) {
			setImageUrl(null);
			setFailed(false);
			return undefined;
		}

		let isMounted = true;
		let objectUrl = null;
		setImageUrl(null);
		setFailed(false);

		const fetchImage = async () => {
			try {
				const url = `${baseURL}/media/${image}`;

				const response = await authAxios.get(url, {
					responseType: 'blob',
				});

				objectUrl = URL.createObjectURL(response.data);

				if (isMounted) {
					setImageUrl(objectUrl);
					setFailed(false);
				}
			} catch (error) {
				console.error('Error fetching image:', error);
				if (isMounted) {
					setImageUrl(null);
					setFailed(true);
				}
			}
		};

		fetchImage();

		return () => {
			isMounted = false;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	}, [image, type]);

	return { url: imageUrl, failed };
};

export default useImageHandler;
