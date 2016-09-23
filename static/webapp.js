

context = document.getElementById('canvas').getContext("2d");

boundingRect = document.getElementById('canvas').getBoundingClientRect()

$('#canvas').mousedown(function(e){
  var mouseX = e.pageX - boundingRect.left;
  var mouseY = e.pageY - boundingRect.top;
    
  paint = true;
  addClick(e.pageX - boundingRect.left, e.pageY - boundingRect.top);
  redraw();
});

$('#canvas').mousemove(function(e){
  if(paint){
    addClick(e.pageX - boundingRect.left, e.pageY - boundingRect.top, true);
    redraw();
  }
});

$('#canvas').mouseup(function(e){
  paint = false;
  drawimg();
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  resetClick();
});

$('#canvas').mouseleave(function(e){
  paint = false;
});

var clickX = new Array();
var clickY = new Array();
var clickDrag = new Array();
var paint;

function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function resetClick()
{
  clickX = [];
  clickY = [];
}

function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  
  // context.strokeStyle = "#df4b26";
  context.strokeStyle = "#000000";
  context.lineJoin = "round";
  context.lineWidth = 16;
      
  for(var i=0; i < clickX.length; i++) {    
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();

    // var radgrad = context.createRadialGradient(clickX[i],clickY[i],0,clickX[i],clickY[i],10);
    // radgrad.addColorStop(0, 'rgba(255,0,0,220)');
    // radgrad.addColorStop(0.2, 'rgba(255,0,0,100)');
    // radgrad.addColorStop(1, 'rgba(255,0,0,0)');
    // context.fillStyle = radgrad;
    // context.fillRect(clickX[i]-5,clickY[i]-5,clickX[i]+5,clickY[i]+5);
  }
}

function drawimg(){
  var img = new Image();
  img.onload = function(){

    var small = document.createElement('canvas').getContext("2d");

    var ctx = document.getElementById("input").getContext("2d");

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    small.drawImage(img,0,0,img.width,img.height,0,0,28,28);
    var inputs = [];
    var data = small.getImageData(0, 0, 28, 28).data;
    for (var i = 0; i < 28; i++) {
      for (var j = 0; j < 28; j++) {
        var n = 4 * (i * 28 + j);
        inputs[i * 28 + j] = data[n + 3] / 255;
        ctx.fillStyle = 'rgba(' + [255-data[n + 3], 255-data[n + 3], 255-data[n + 3], data[n + 3]].join(',') + ')';
        ctx.fillRect(j * 8 + 1, i * 8 + 1, 6, 6);
        //ctx.fillRect(j,i,1,1);
                  }
              }

    $.ajax({
            url: '/predict/',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(inputs),
            success: (data) => {
              var max_index = 0;
              for (var j = 0; j < 10; j++) {
                if (parseFloat(data[j])>parseFloat(data[max_index])){
                  max_index = j;
                }
              }
              for (var j = 0; j < 10; j++) {
                  if (j === max_index) {
                      $('#predictions tr').eq(j).find('td').eq(1).addClass('predicted').text((parseFloat(data[j])*100).toFixed(0) + '%');
                  } else {
                      $('#predictions tr').eq(j).find('td').eq(1).removeClass('predicted').text((parseFloat(data[j])*100).toFixed(0) + '%');
                  }
              }
            }
            });

  };
  img.src = $('#canvas')[0].toDataURL();
  


}

