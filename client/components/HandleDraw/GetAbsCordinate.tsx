interface objects {
  left: number;
  top: number;
  scaleX: number;
  scaleY: number;
  width: number;
  height: number;
  group: {
    left: number;
    top: number;
    scaleX: number;
    scaleY: number;
    width: number;
    height: number;
  };
}

const getAbsLeft = (objects: objects) => {
  if (objects.group) {
    return objects.left + objects.group.left + objects.group.width / 2;
  }
  return objects.left;
};
const getAbsTop = (objects: objects) => {
  if (objects.group) {
    return objects.top + objects.group.top + objects.group.height / 2;
  }
  return objects.top;
};
const getAbsScaleX = (objects: objects) => {
  if (objects.group) {
    return objects.scaleX * objects.group.scaleX;
  }
  return objects.scaleX;
};
const getAbsScaleY = (objects: objects) => {
  if (objects.group) {
    return objects.scaleY * objects.group.scaleY;
  }
  return objects.scaleY;
};

export { getAbsLeft, getAbsTop, getAbsScaleX, getAbsScaleY };
