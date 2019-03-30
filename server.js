var express = require('express')
var app = express()
account=require('./account.json');
fs = require('fs');
mysql = require('mysql');
var connection = mysql.createConnection({
                                    host: account.host,
                                    user: account.user,
                                    password: account.password,
                                    database: account.database
                                    })
connection.connect();

function insert_sensor(value) {
obj = {};
obj.value = value;

var query = connection.query('insert into sensors set ?', obj, function(err, rows, cols) {
                             if (err) throw err;
                             console.log("database insertion ok= %j", obj);
                             });
}

app.get('/', function(req, res) {
    res.end('Connected. ');
    });

app.get('/log', function(req, res) {
    r = req.query;
    console.log("GET %j", r);
    
    insert_sensor(r.value,req.connection.remoteAddress);
    res.end('OK:' + JSON.stringify(req.query));
    });

app.get('/graph', function (req, res) {
    console.log('got app.get(graph)');
    var html = fs.readFile('./graph.html', function (err, html) {
                           html = " "+ html
                           console.log('read file');
                           
                           var qstr = 'select * from sensors ';
                           connection.query(qstr, function(err, rows, cols) {
                                            if (err) throw err;
                                            
                                            var data = "";
                                            var comma = "";
                                            var plus="<p align=";
                                            plus+="\"";
                                            plus+="center";
                                            plus+="\">";
                                            for (var i=0; i< rows.length; i++) {
                                            r = rows[i];
                                            var v=r.time.toISOString().split('T');
                                            var DATE=v[0].split('-');
                                            var TIME=v[1].split(':');
                                            DATE[1]-=1;
                                            data += comma + "[new Date("+DATE[0]+","+DATE[1]+","+DATE[2]+","+TIME[0]+","+TIME[1]+"),"+ r.value +"]";
                                            DATE[1]+=1;
                                            if(i==0)
                                            plus+=DATE[0]+"년 "+DATE[1]+"월 "+DATE[2]+"일 "+TIME[0]+"시 "+TIME[1]+"분 ~~~~ ";
                                            if(i==rows.length-1)
                                            plus+=DATE[0]+"년 "+DATE[1]+"월 "+DATE[2]+"일 "+TIME[0]+"시 "+TIME[1]+"분 </p> ";
                                            //data+=comma+"[new Date("+r.time.toISOString()+"),"+r.value+"]";
                                            comma = ",";
                                            }
                                            var header = "data.addColumn('date', 'Date/Time');"
                                            header += "data.addColumn('number', 'Temp');"
                                            html = html.replace("<%HEADER%>", header);
                                            html = html.replace("<%DATA%>", data);
                                            html = html.replace("<%plus%>",plus);
                                            res.writeHeader(200, {"Content-Type": "text/html"});
                                            res.write(html);
                                            fs.writeFile('/opt/lampp/htdocs/dashboard/graph.html',html,(err)=>{
                                                         if(err) throw err;
                                                         console.log('The graph is sended to Apache server.');
                                                         });
                                            res.end(html);
                                            });
                           });
    })

var server = app.listen(9000, function () {
                    var host = server.address().address
                    var port = server.address().port
                    console.log('listening at http://%s:%s', host, port)
                    });
