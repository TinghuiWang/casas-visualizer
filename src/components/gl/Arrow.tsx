export function drawArrow(
  ctx:CanvasRenderingContext2D,
  x0:number, y0:number,
  x1:number, y1:number,
  width?:number
) {
  let arrowWidth = 3;
  if(width && width > 3) {
    arrowWidth = width;
  }

  const polarCoordinate2canvasCoordinate = (
    x0: number, y0: number, r: number, radian: number
  ) => {
    let x = r * Math.cos(radian);
    let y = r * Math.sin(radian);
    x += x0;
    y += y0;
    return { x, y };
  }

  const distance = Math.sqrt((y1 - y0) * (y1 - y0) + (x1 - x0) * (x1 - x0));
  let radian = Math.asin(Math.abs(y1 - y0) / distance);
  if (x0 > x1 && y1 > y0) {
    radian = Math.PI - radian;
  } else if (x0 > x1 && y0 > y1) {
    radian += Math.PI;
  } else if (x1 > x0 && y0 > y1) {
    radian = 2 * Math.PI - radian;
  }

  let { x, y } = polarCoordinate2canvasCoordinate(
    x0, y0, distance - arrowWidth * 2, radian
  );
  let p1 = polarCoordinate2canvasCoordinate(
    x, y, arrowWidth, radian - Math.PI * 0.5
  );
  let p2 = polarCoordinate2canvasCoordinate(
    x, y, arrowWidth * 2, radian - Math.PI * 0.5
  );
  let p3 = polarCoordinate2canvasCoordinate(
    x, y, arrowWidth, radian + Math.PI * 0.5
  );
  let p4 = polarCoordinate2canvasCoordinate(
    x, y, arrowWidth * 2, radian + Math.PI * 0.5
  );

  ctx.moveTo(x0, y0);
  ctx.lineTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(x1, y1);
  ctx.lineTo(p4.x, p4.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.closePath();
}

export function fillArrow(
  ctx:CanvasRenderingContext2D,
  x0:number, y0:number,
  x1:number, y1:number,
  width?:number
) {
  ctx.save();
  ctx.beginPath();
  drawArrow(ctx, x0, y0, x1, y1, width);
  ctx.fill();
  ctx.restore();
}

export function strokeArrow(
  ctx:CanvasRenderingContext2D,
  x0:number, y0:number,
  x1:number, y1:number,
  width?:number
) {
  ctx.save();
  ctx.beginPath();
  drawArrow(ctx, x0, y0, x1, y1, width);
  ctx.stroke();
  ctx.restore();
}
