import React, { useEffect, useState } from 'react';
import no_image from '../../assets/img/Avatar.svg';
import useImageHandler from '../../hooks/useImageHandler';
import { isBase64Image, normalizeMediaPath } from '../../helpers/functions';
import urlMaker from '../../helpers/UrlMaker';

type ImageCellProps = {
	fullImage?: string | null;
	size?: number;
};

const ImageCell = ({ fullImage, size = 50 }: ImageCellProps) => {
	const isDataUrl = Boolean(fullImage && isBase64Image(fullImage));
	const mediaPath = isDataUrl ? null : normalizeMediaPath(fullImage);
	const { url: blobUrl, failed } = useImageHandler(mediaPath, 'avatars');
	const [broken, setBroken] = useState(false);

	useEffect(() => {
		setBroken(false);
	}, [fullImage]);

	const imageSrc =
		isDataUrl && fullImage
			? String(fullImage)
			: blobUrl
				? blobUrl
				: !fullImage || failed || broken || mediaPath
					? no_image
					: /^https?:\/\//i.test(String(fullImage))
						? String(fullImage)
						: urlMaker(String(fullImage), 'avatars') || no_image;

	const isPlaceholder = imageSrc === no_image;

	return (
		<div
			style={{
				width: size,
				height: size,
				borderRadius: '50%',
				overflow: 'hidden',
				border: '1px solid #e0e0e0',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#fafafa',
				boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
			}}>
			<img
				src={imageSrc}
				alt=''
				style={{
					width: isPlaceholder ? '70%' : '100%',
					height: isPlaceholder ? '70%' : '100%',
					objectFit: isPlaceholder ? 'contain' : 'cover',
					borderRadius: isPlaceholder ? 0 : 6,
				}}
				onError={() => setBroken(true)}
			/>
		</div>
	);
};

export default ImageCell;
