window.onload = function() {
    var pol_num = 0;
    var Polygons_2D = [{ x: [], y: [] }];
    var graph = document.getElementById("graph");

    var matrix_template = $("#matrix_table").html();

    class Matrix {
        constructor(rows, columns) {
            if (typeof rows === "object") {
                this.rows = 3;
                this.columns = rows.x.length;
                this.data = new Array(3);

                for (var i = 0; i < 3; i++)
                    this.data[i] = new Array(this.columns);
                this.data[0] = rows.x.slice();
                this.data[1] = rows.y.slice();
                this.data[2].fill(1);
            } else if (typeof rows === "string") {
                var splt_string = rows.split(";").filter(Boolean);
                this.rows = splt_string.length;
                this.data = new Array(this.rows);
                splt_string.forEach((e, i) => {
                    this.data[i] = e
                        .split(" ")
                        .filter(Boolean)
                        .map(num => {
                            return parseFloat(num);
                        });
                });
                this.columns = this.data[0].length;
            } else {
                this.rows = rows;
                this.columns = columns;
                this.data = new Array(rows);

                for (var i = 0; i < this.rows; i++) {
                    this.data[i] = new Array(this.columns);
                    this.data[i].fill(0);
                }
            }
        }

        multiply(matb) {
            if (this.columns != matb.rows) console.log("Error");

            var product = new Matrix(this.rows, matb.columns);
            for (var i = 0; i < product.rows; i++) {
                for (var j = 0; j < product.columns; j++) {
                    product.data[i][j] = 0;

                    for (var k = 0; k < this.columns; k++)
                        product.data[i][j] += this.data[i][k] * matb.data[k][j];
                }
            }
            return product;
        }

        add(matb) {
            var sum = new Matrix(this.rows, this.columns);
            for (var i = 0; i < this.rows; i++)
                for (var j = 0; j < this.columns; j++)
                    sum.data[i][j] = this.data[i][j] + matb.data[i][j];
            return sum;
        }

        subtract(matb) {
            var sum = new Matrix(this.rows, this.columns);
            for (var i = 0; i < this.rows; i++)
                for (var j = 0; j < this.columns; j++)
                    sum.data[i][j] = this.data[i][j] - matb.data[i][j];
            return sum;
        }

        multiplyByScalar(x) {
            var sum = new Matrix(this.rows, this.columns);
            for (var i = 0; i < this.rows; i++)
                for (var j = 0; j < this.columns; j++)
                    sum.data[i][j] = this.data[i][j] * x;
            return sum;
        }
    }

    function identityMatrix(n)
    {
        var id = new Matrix(n, n);
        for(var i = 0; i < n;i++)
            id.data[i][i] = 1;
        return id;
    }

    function create2DRotationMatrix(angle) {
        var radians = (angle * Math.PI) / 180;
        var rot = new Matrix(3, 3);
        rot.data[0][0] = Math.cos(radians);
        rot.data[0][1] = -1 * Math.sin(radians);
        rot.data[1][0] = Math.sin(radians);
        rot.data[1][1] = Math.cos(radians);
        rot.data[2][2] = 1;
        return rot;
    }


    function createTranslationMatrix(x, y)
    {
        var transMatrix = identityMatrix(3);
        transMatrix.data[0][2] = x;
        transMatrix.data[1][2] = y;
        return transMatrix;
    }

    var layout = {
        xaxis: {
            autotick: false,
            range: [-8, 8]
        },
        yaxis: {
            autotick: false,
            range: [-8, 8]
        },
        width: 1000,
        height: 900
    };

    function changePolyPoints(id)
    {
        var tableID = "#table_body" + id;
        var rows = Polygons_2D[id].x.length-1;
        console.log(Polygons_2D[id]);
        
        $(tableID).html('');
        for(var i = 0; i < rows;i++)
        {
            $(tableID).append(
                "<tr>" +
                    "<td>" +
                    Polygons_2D[id].x[i] +
                    "</td>" +
                    "<td>" +
                    Polygons_2D[id].y[i] +
                    "</td>" +
                "</tr>"
            );
        }
    }


    function animateAndChange(matrix, id)
    {
        Plotly.animate(
            graph,
            {
                data: [
                    {
                        x: matrix.data[0],
                        y: matrix.data[1]
                    }
                ],
                traces: [id - 1]
            },
            {
                transition: {
                    duration: 500,
                    easing: "cubic-in-out"
                },
                frame: {
                    duration: 500
                }
            }
        );
        
        var data_points = {x: matrix.data[0], y:matrix.data[1]};
        Polygons_2D[id] = data_points;
        changePolyPoints(id);

    }

    $(document).delegate("#rotateBtn", "click", function(event) {
        var polygonId = parseInt($("#polygonID").val());
        var points = new Matrix(Polygons_2D[polygonId]);
        var angle = parseFloat($("#angle").val());
        var x = points.data[0][0];
        var y = points.data[1][0];
        var forwardTranslation = createTranslationMatrix(-1*x, -1*y);
        var rot_matrix = create2DRotationMatrix(angle);
        var backwardTranslation = createTranslationMatrix(x, y);
        var trans_matrix = backwardTranslation.multiply(rot_matrix).multiply(forwardTranslation);

        var element_text = Mustache.render(matrix_template, {x1: trans_matrix.data[0], x2: trans_matrix.data[1], x3: trans_matrix.data[2]});
        $('#matrix').html(element_text);

        var points_after_transformation = trans_matrix.multiply(points);

        animateAndChange(points_after_transformation, polygonId);
        
    });

    $(document).delegate(".plotBtn", "click", function() {
        var polygonId = this.id.substr(4);
        var tableID = "#table_body" + polygonId + " :input";
        var inputFields = $(tableID);

        for (var i = 0; i < inputFields.length / 2; i++) {
            Polygons_2D[polygonId].x.push(parseFloat($(inputFields[2 * i]).val()));
            Polygons_2D[polygonId].y.push(parseFloat($(inputFields[2 * i + 1]).val()));
        }

        Polygons_2D[polygonId].x.push(parseFloat($(inputFields[0]).val()));
        Polygons_2D[polygonId].y.push(parseFloat($(inputFields[1]).val()));

        changePolyPoints(polygonId);
        Plotly.newPlot(graph, Polygons_2D.slice(1), layout, {
            showSendToCloud: true
        });
    });

    $('#translate').on('click', function(event)
    {
        var polygonId = parseInt($('#polygonID').val());
        var points = new Matrix(Polygons_2D[polygonId]);
        var x = parseFloat($('#x').val()) - points.data[0][0];
        var y = parseFloat($('#y').val()) - points.data[1][0];
        var transMatrix = createTranslationMatrix(x, y);

        var element_text = Mustache.render(matrix_template, {x1: transMatrix.data[0], x2: transMatrix.data[1], x3: transMatrix.data[2]});
        $('#matrix').html(element_text);

        var points_after_transformation = transMatrix.multiply(points);
        animateAndChange(points_after_transformation, polygonId);
    });

    function createScalingMatrix(fx, fy)
    {
        var scalMat = identityMatrix(3);
        scalMat.data[0][0] = fx;
        scalMat.data[1][1] = fy;
        return scalMat;
    }

    $('#scale').on('click', function(event)
    {
        var polygonId = parseInt($('#polygonID').val());
        var points = new Matrix(Polygons_2D[polygonId]);
        var fx = parseFloat($('#fx').val());
        var fy = parseFloat($('#fy').val());

        var x = points.data[0][0];
        var y = points.data[1][0];

        var forwardTranslation = createTranslationMatrix(-1*x, -1*y);
        var scalMat = createScalingMatrix(fx, fy);
        var backwardTranslation = createTranslationMatrix(x, y);
        var trans_matrix = backwardTranslation.multiply(scalMat).multiply(forwardTranslation);

        var element_text = Mustache.render(matrix_template, {x1: trans_matrix.data[0], x2: trans_matrix.data[1], x3: trans_matrix.data[2]});
        $('#matrix').html(element_text);

        var points_after_transformation = trans_matrix.multiply(points);

        animateAndChange(points_after_transformation, polygonId);
    });


    $('#reflectX').on('click', function(event){
        var polygonId = parseInt($('#polygonID').val());
        var points = new Matrix(Polygons_2D[polygonId]);

        var reflectMatrix = identityMatrix(3);
        reflectMatrix.data[0][0] = -1;

        var element_text = Mustache.render(matrix_template, {x1: reflectMatrix.data[0], x2: reflectMatrix.data[1], x3: reflectMatrix.data[2]});
        $('#matrix').html(element_text);

        var points_after_transformation = reflectMatrix.multiply(points);

        animateAndChange(points_after_transformation, polygonId);

    });


    $('#reflectY').on('click', function(event){
        var polygonId = parseInt($('#polygonID').val());
        var points = new Matrix(Polygons_2D[polygonId]);

        var reflectMatrix = identityMatrix(3);
        reflectMatrix.data[1][1] = -1;

        var element_text = Mustache.render(matrix_template, {x1: reflectMatrix.data[0], x2: reflectMatrix.data[1], x3: reflectMatrix.data[2]});
        $('#matrix').html(element_text);

        var points_after_transformation = reflectMatrix.multiply(points);

        animateAndChange(points_after_transformation, polygonId);

    });


    $('#reflectXY').on('click', function(event){
        var polygonId = parseInt($('#polygonID').val());
        var points = new Matrix(Polygons_2D[polygonId]);

        var reflectMatrix = new Matrix(3, 3);
        reflectMatrix.data[0][1] = 1;
        reflectMatrix.data[1][0] = 1;
        reflectMatrix.data[2][2] = 1;

        var element_text = Mustache.render(matrix_template, {x1: reflectMatrix.data[0], x2: reflectMatrix.data[1], x3: reflectMatrix.data[2]});
        $('#matrix').html(element_text);

        var points_after_transformation = reflectMatrix.multiply(points);

        animateAndChange(points_after_transformation, polygonId);

    });

    $('#reflectXYneg').on('click', function(event){
        var polygonId = parseInt($('#polygonID').val());
        var points = new Matrix(Polygons_2D[polygonId]);

        var reflectMatrix = new Matrix(3, 3);
        reflectMatrix.data[0][1] = -1;
        reflectMatrix.data[1][0] = -1;
        reflectMatrix.data[2][2] = 1;

        var element_text = Mustache.render(matrix_template, {x1: reflectMatrix.data[0], x2: reflectMatrix.data[1], x3: reflectMatrix.data[2]});
        $('#matrix').html(element_text);

        var points_after_transformation = reflectMatrix.multiply(points);

        animateAndChange(points_after_transformation, polygonId);

    });


    $("#addPolygons").on("click", function(event) {
        var numVertices = parseInt($("#numVertices").val());

        var tmp_data = { pol_id: pol_num + 1, numVertices: numVertices };
        pol_num++;

        var newPoly = { x: [], y: [] };
        Polygons_2D.push(newPoly);

        var my_tmp = $("#list_element").html();
        var list_element_text = Mustache.render(my_tmp, tmp_data);
        $("#polygons").append(list_element_text);

        var tableID = "#table_body" + pol_num;
        for (var i = 0; i < numVertices; i++) {
            $(tableID).append(
                "<tr>" +
                    "<td>" +
                    '<input class="form-control">' +
                    "</td>" +
                    "<td>" +
                    '<input class="form-control">' +
                    "</td>" +
                    "</tr>"
            );
        }
    });
};
