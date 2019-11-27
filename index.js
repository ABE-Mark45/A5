window.onload = function()
{
var pol_num = 0;
var Polygons_2D = [{x:[], y:[]}];
var graph = document.getElementById("graph");

class Matrix
{
    constructor(rows, columns)
    {
        if(typeof(rows) === 'object')
        {
            this.rows = 3;
            this.columns = rows.x.length;
            this.data = new Array(3);
            
            for(var i = 0; i < 3;i++)
                this.data[i] = new Array(this.columns);
            this.data[0] = rows.x.slice();
            this.data[1] = rows.y.slice();
            this.data[2].fill(1);
        }  

        else if(typeof(rows) === 'string')
        {
            var splt_string = rows.split(';').filter(Boolean);
            this.rows = splt_string.length;
            this.data = new Array(this.rows);
            splt_string.forEach((e, i) => {
              this.data[i] = e.split(' ').filter(Boolean).map(num => {return parseFloat(num)});
            });
            this.columns = this.data[0].length;
        }else
        {
            this.rows = rows;
            this.columns = columns;
            this.data = new Array(rows);
            
            for(var i = 0; i < this.rows;i++)
            {
                this.data[i] = new Array(this.columns);
                this.data[i].fill(0);
            }

        }
    }


    multiply(matb) {
        if(this.columns != matb.rows)
          console.log("Error");

        var product = new Matrix(this.rows, matb.columns);
        for(var i = 0; i < product.rows;i++)
        {
            for(var j = 0; j < product.columns;j++)
            {
              product.data[i][j] = 0;

                for(var k = 0; k < this.columns;k++)
                    product.data[i][j] += this.data[i][k] * matb.data[k][j];
            }
        }
        return product;
        
    }

    add(matb)
    {
        var sum = new Matrix(this.rows, this.columns);
        for(var i = 0; i < this.rows;i++)
            for(var j = 0; j < this.columns;j++)
                sum.data[i][j] = this.data[i][j] + matb.data[i][j];
        return sum;
    }


    subtract(matb)
    {
        var sum = new Matrix(this.rows, this.columns);
        for(var i = 0; i < this.rows;i++)
            for(var j = 0; j < this.columns;j++)
                sum.data[i][j] = this.data[i][j] - matb.data[i][j];
        return sum;
    }

    multiplyByScalar(x)
    {
      var sum = new Matrix(this.rows, this.columns);
      for(var i = 0; i < this.rows;i++)
          for(var j = 0; j < this.columns;j++)
              sum.data[i][j] = this.data[i][j] * x;
      return sum;
    }

}


function create2DRotationMatrix(angle)
{
    var radians = angle * Math.PI / 180;
    var rot = new Matrix(3, 3);
    rot.data[0][0] = Math.cos(radians);
    rot.data[0][1] = -1* Math.sin(radians);
    rot.data[1][0] = Math.sin(radians);
    rot.data[1][1] = Math.cos(radians);
    rot.data[2][2] = 1;
    return rot;
}


class Point
{
    constructor(x, y)
    {
        this.x = x;
        this.y = y;
        this.z = 1;
    }

    pointToMatrix()
    {
        var pointMat = new Matrix(3, 1);
        pointMat.data[0][0] = this.x;
        pointMat.data[1][0] = this.y;
        pointMat.data[2][0] = 1;
        return pointMat;
    }

    rotatePoint(angle)
    {

        var rotationMat = create2DRotationMatrix(angle);
        var pointToMat = this.pointToMatrix();
        var rotatedPoint = rotationMat.multiply(pointToMat);
        
        return new Point(rotatedPoint.data[0][0], rotatedPoint.data[1][0]);
    }
}



var p = new Point(2.5, 3);
var myPoint = p.rotatePoint(45);

this.console.log(myPoint);

var data = {
  x: [0, 1, 1, 0, 0],
  y: [0, 0, 1, 1, 0]
}




function rotate(data, angle)
{
}

var layout = {
    xaxis: {
      autotick:false,
      range: [-5, 5]
    },
    yaxis: {
      autotick: false,
      range: [-5, 5]
    },
    width: 1000,
    height: 900
}



$(document).delegate('.rotateBtn' ,'click', function(event){
      var polygonId = this.id.substr(6);
      var points = new Matrix(Polygons_2D[polygonId]);
      var angle = parseFloat($('#angle' + polygonId).val());

      var rot_matrix = create2DRotationMatrix(angle);
      var points_after_transformation = rot_matrix.multiply(points);

      console.log(points_after_transformation);

      Plotly.animate(graph, {
        data: [ {
                  x: points_after_transformation[0],
                  y: points_after_transformation[1]
                }],
        traces: [polygonId-1],
        layout: layout
      }, {
        transition: {
          duration: 500,
          easing: 'cubic-in-out'
        },
          frame: {
              duration: 500
          }
      })
    
      
});

$(document).delegate('.addPoints', 'click',function(){
    var polygonId = this.id.substr(3);
    var tableID = '#table_body' + polygonId;
    var tableTransform = '#table_transformation' + polygonId;
    var x_coord = $("#x"+polygonId).val(),
        y_ccord = $("#y"+polygonId).val();
    
    $("#x"+polygonId).val('');
    $("#y"+polygonId).val('');

    Polygons_2D[polygonId].x.push(parseInt(x_coord));
    Polygons_2D[polygonId].y.push(parseInt(y_ccord));
    $(tableID).append("<tr>"+
    '<td>' + x_coord + '</td>'+
    '<td>' + y_ccord + '</td>'+
    "</tr>");
    
    $(tableTransform).append("<tr>"+
    '<td> </td>'+
    '<td> </td>'+
    "</tr>");
    
})


$(document).delegate('.plotBtn', 'click', function(){
    var polygonId = this.id.substr(4);
    Polygons_2D[polygonId].x.push(Polygons_2D[polygonId].x[0]);
    Polygons_2D[polygonId].y.push(Polygons_2D[polygonId].y[0]);
    Plotly.newPlot(graph, [{
      x: Polygons_2D[polygonId].x,
      y: Polygons_2D[polygonId].y
    }], layout, {showSendToCloud:true});

})

$('#addPolygons').on('click', function (event){
    var tmp_data = {pol_id: pol_num+1};
    pol_num++;

    var newPoly = {x:[], y:[]};
    Polygons_2D.push(newPoly);
    console.log(Polygons_2D);
    

    var my_tmp = $("#list_element").html();
    var list_element_text = Mustache.render(my_tmp, tmp_data);
    $('#polygons').append(list_element_text);
})



var btn = document.getElementById('mybtn');

function plot(data)
{

}


btn.onclick = function() {
  Plotly.animate(graph, {
    data: [ {
              x: [0, 1, 1, 0, 0],
              y: [0, 0, 1, 1, 0]
            }],
    traces: [1],
    layout: {
      
    }
  }, {
    transition: {
      duration: 500,
      easing: 'cubic-in-out'
    },
      frame: {
          duration: 500
      }
  })
}
}