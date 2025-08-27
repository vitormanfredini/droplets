function make2dArray(width, height, defaultValue) {
    var arr = [];
    for(let i = 0; i < height; i++) {
        arr[i] = [];
        for(let j = 0; j < width; j++) {
            arr[i][j] = defaultValue;
        }
    }
    return arr;
}

function output2dArray(array){
  let string = "";
  for(let i = 0; i < array.length; i++) {
    string += array[i].join('');
    if(i < array.length-1){
      string += "\n";
    }
  }
  process.stdout.write(string)
}

function reflectPoint(point,min,max){
  if(point < min){
    return -point;
  }
  if(point >= max){
    return max - (point - max+1);
  }
  return point;
}

function applyDrop(array, dropX, dropY, distance, threshold, charToUse){

  // let iMin = -process.stdout.rows+1;
  // let iMax = array.length + process.stdout.rows-1;
  let iMin = Math.max(-process.stdout.rows+1,dropY-Math.ceil(distance));
  let iMax = Math.min(array.length + process.stdout.rows-1,dropY+Math.ceil(distance));

  // let jMin = -process.stdout.columns+1;
  // let jMax = array[0].length + process.stdout.columns-1;
  let jMin = Math.max(-process.stdout.columns+1,dropX-Math.ceil(distance));
  let jMax = Math.min(array[0].length + process.stdout.columns-1,dropX+Math.ceil(distance));

  for(let i = iMin; i < iMax; i++) {
    for(let j = jMin; j < jMax; j++) {
      let calcDist = distanceBetweenPoints(j,i,dropX,dropY);
      if(Math.abs(calcDist - distance) < threshold){
        array[
          reflectPoint(i,0,process.stdout.rows)
        ][
          reflectPoint(j,0,process.stdout.columns)
        ] = charToUse;
        // if(i < 0 || i >= process.stdout.rows){
        //   continue;
        // }
        // if(j < 0 || j >= process.stdout.columns){
        //   continue;
        // }
        // array[i][j] = charToUse;
      }
    }
  }
  return array;
}

function distanceBetweenPoints(x1,y1,x2,y2){
  let verticalCorrectionFactor = 1.8; // corrige diferença da distancia horizontal/vertical no terminal
  return Math.sqrt(Math.pow(x2-x1,2) + Math.pow((y2-y1)*verticalCorrectionFactor,2));
}

function updateDrops(drops, increment){
  for(let c=0;c<drops.length;c++){
    if(drops[c].distance > getMaxDistance()){
      drops.splice(c,1);
    }
  }
  for(let c=0;c<drops.length;c++){
    drops[c].distance += increment;
  }
  return drops;
}

function charsInStrength(index){
  let chars = ['#','|',';','.',' ']
  index = index >= chars.length ? (chars.length - 1) : index
  return chars[index]
}

function applyAllDrops(array, drops, threshold){
  for(let c=0;c<drops.length;c++){
    let distance = drops[c].distance;
    let maxWaves = 6;
    let wave = 0;
    while(distance > 2 && wave < maxWaves){
      array = applyDrop(
        array,
        drops[c].x,
        drops[c].y,
        distance,
        threshold,
        charsInStrength(Math.floor(distance/25))
      );
      distance -= 5;
      wave += 1;
    }
  }
  return array;
}

function getNextDropFrame(){
  return Math.round(25 + Math.random() * 30);
}

function createDrop(){
  return {
    x: Math.floor(Math.random() * process.stdout.columns),
    y: Math.floor(Math.random() * process.stdout.rows),
    distance: 1
  }
}

let calculatedMaxDistance = 0;
function getMaxDistance(){
  if(calculatedMaxDistance > 0){
    return calculatedMaxDistance;
  }
  // calculatedMaxDistance = distanceBetweenPoints(0,0,process.stdout.columns*2,process.stdout.rows*2);
  calculatedMaxDistance = distanceBetweenPoints(0,0,process.stdout.columns,process.stdout.rows);
  return calculatedMaxDistance;
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

let drops = [];
let nextDrop = 1;

while(true){

  let imageArray = make2dArray(
    process.stdout.columns,
    process.stdout.rows,
    " "
  );

  imageArray = applyAllDrops(imageArray, drops, 0.85);

  console.clear()
  output2dArray(imageArray);

  await sleep(40)

  nextDrop--;
  if(nextDrop <= 0){
    drops.push(createDrop());
    nextDrop = getNextDropFrame();
  }
  drops = updateDrops(drops, 0.5);
}  
