import FaFile from '@fallcrate/assets/fa-file.svg';
import FaFolder from '@fallcrate/assets/fa-folder.svg';

const boxWidth = 180;
const boxHeight = 30;
const fileSpacing = 5;
const badgeSize = 20;
const badgeCoords = {
  x: boxWidth - 2,
  y: 2,
};
const iconSize = 16;
const iconLeftPadding = iconSize / 2;
const filenamePadding = 5;
const filenameFontSize = 12;
const [canvasWidth, canvasHeight] = [300, 60]; // just needs to be big enough to fit everything

const drawBadge = (
  ctx: CanvasRenderingContext2D,
  numItems: number,
  badgeCoords: { x: number; y: number },
  badgeSize: number,
) => {
  // draw the circular badge for the number of items at the top-right of the top box
  ctx.fillStyle = 'rgba(255,0,0,0.8)';
  ctx.beginPath();
  ctx.arc(badgeCoords.x, badgeCoords.y, badgeSize / 2, 0, 2 * Math.PI);
  ctx.fill();
  ctx.fillStyle = 'white';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText(numItems.toString(), badgeCoords.x, badgeCoords.y);
};

const drawFileBox = (
  ctx: CanvasRenderingContext2D,
  coords: { x: number; y: number } = { x: 0, y: 0 },
) => {
  ctx.fillStyle = 'rgba(255,255,255,1)'; // background color
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'; // border color
  ctx.lineWidth = 1;
  ctx.fillRect(coords.x, coords.y, boxWidth, boxHeight);
  ctx.strokeRect(coords.x, coords.y, boxWidth, boxHeight);
};

const drawIcon = (ctx: CanvasRenderingContext2D, icon: HTMLImageElement) => {
  const iconCoords = {
    x: iconLeftPadding,
    y: (boxHeight - iconSize) / 2,
  };
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.drawImage(icon, iconCoords.x, iconCoords.y, iconSize, iconSize);
};

// draw the filename to the right of the icon, but truncate it if it's too long
const drawFilename = (ctx: CanvasRenderingContext2D, filename: string) => {
  const filenameCoords = {
    x: iconLeftPadding + iconSize + filenamePadding,
    y: boxHeight / 2,
  };
  ctx.fillStyle = 'black';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = `${filenameFontSize}px sans-serif`;

  const maxFilenameWidth = boxWidth - filenameCoords.x;
  const filenameText =
    ctx.measureText(filename).width > maxFilenameWidth
      ? `${filename.slice(0, 22)}...`
      : filename;
  ctx.fillText(filenameText, filenameCoords.x, filenameCoords.y);
};

export function createDragPreview(
  name: string,
  isFolder: boolean,
  numItems = 4,
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // translate the context down so the badge doesn't get cut off
    context.translate(0, badgeSize / 2 - badgeCoords.y);

    // draw the file boxes
    if (numItems >= 3) {
      drawFileBox(context, {
        x: fileSpacing * 2,
        y: fileSpacing * 2,
      });
    }
    if (numItems >= 2) {
      drawFileBox(context, {
        x: fileSpacing,
        y: fileSpacing,
      });
    }
    drawFileBox(context);

    // draw the folder/file icon, source files are 'fa-file.svg' & 'fa-folder.svg' in src/assets
    const icon = new Image();
    icon.onload = () => {
      drawIcon(context, icon);

      // draw the badge
      drawBadge(context, numItems, badgeCoords, badgeSize);

      // draw the filename
      drawFilename(context, name);

      const image = new Image();
      image.src = canvas.toDataURL(); // Convert the canvas to an image

      resolve(image);
    };
    icon.onerror = () => {
      reject('Icon could not be loaded');
    };
    icon.src = isFolder ? FaFolder : FaFile;
  });
}
