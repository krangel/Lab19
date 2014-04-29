// Module dependencies

var express    = require('express');
var mysql      = require('mysql'),
    ejs        = require('ejs'),
    connect    = require('connect');

// Application initialization

var connection = mysql.createConnection({
    host     : 'cwolf.cs.sonoma.edu',
    user     : 'krangel',
    password : '3114181'
});

//var app = module.exports = express.createServer();
var app = express();
app.set('subtitle', 'Lab 18');

// Database setup
//connection.query('DROP DATABASE IF EXISTS krangel', function(err) {
//	if (err) throw err;
//	connection.query('CREATE DATABASE IF NOT EXISTS krangel', function (err) {
//	    if (err) throw err;
connection.query('USE krangel', function (err) {
    if (err) throw err;
    connection.query('CREATE TABLE IF NOT EXISTS patientInfo('
		     + 'PatientID INT NOT NULL AUTO_INCREMENT,'
        	     + 'PRIMARY KEY (PatientID),'
		     + 'pFName VARCHAR(25),'
		     + 'pLName VARCHAR(25),'
		     + 'homeAddress VARCHAR(50),'
		     + 'pPhoneNum INT'
	             +  ')', function (err) {
        	         if (err) throw err;
	             });
    
});

// Configuration
//app.use(express.bodyParser());
app.use(connect.urlencoded());
app.use(connect.json());

// Static content directory
app.use(express.static('public'));

app.set('view engine', 'ejs');

// Main route sends our HTML file
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
    res.render('index');
});

app.get('/add_patient', function(req, res) {
  res.render('add_patient');
});

app.get('/add_doctor', function(req, res) {
  res.render('add_doctor');
});

app.get('/patient_info', function(req, res) {
  res.render('patient_info');
});

app.get('/doctor_info', function(req, res) {
  res.render('doctor_info');
});

/*app.get('/test', function(req, res){
res.render('test');
});
app.get('/lab18', function(req, res){
res.render('lab18');
   }
);


app.get('/users', function(req, res) {
    var result = [
	{UserID: 1, Email: 'mhaderman'},
	{UserID: 2, Email: 'test'}
    ];
    res.render('displayerUserTable.ejs', {rs: result});
});
*/
app.get('/doctorInfo', function(req, res){
    connection.query('select * from doctorInfo',
		     function(err, result){
			 res.render('doctor_info.ejs', {rs:result});
		     }
		    );
})

// Update MySQL database
app.post('/patient_info', function (req, res) {
    if(typeof req.body.id != 'undefined'){
	connection.query('select PatientID, pFName, pLName, homeAddress, pPhoneNum from patientInfo where pLName = ?', req.body.pLName, 
			 function (err, result) {
			     if(result.length > 0) {
  				 res.send('Last Name: ' + result[0].pLName + '<br />' +
		  			  'First Name: ' + result[0].pFName  + '<br />' +
					  'Address: ' + result[0].homeAddress  + '<br />' +
					  'Number: ' + result[0].pPhoneNum
					 );
			     }
			     else
				 res.send('User does not exist.');
			 });
	
    }	
});

app.post('/add_patient', function (req, res) {
    connection.query('INSERT INTO patientInfo SET ?', req.body, 
        function (err, result) {
            if (err) throw err;
            connection.query('select PatientID, pFName, pLName, homeAddress, pPhoneNum from patientInfo where pLName = ?', req.body.pLName, 
		function (err, result) {
                    if(result.length > 0) {
  	              res.send('Last Name: ' + result[0].pLName + '<br />' +
		  	       'First Name: ' + result[0].pFName  + '<br />' +
			       'Address: ' + result[0].homeAddress  + '<br />' +
			       'Number: ' + result[0].pPhoneNum
		      );
                    }
                    else
                      res.send('User was not inserted.');
		});
        }
    );
});

app.post('/doctor_info', function (req, res) {
    connection.query('select * from doctorInfo where DoctorID = ?', req.body.DoctorID,
                     function (err, result) {
			 if(result.length > 0) {
			     res.send('Last Name: ' + result[0].drLName + '<br />' +
				      'First Name: ' + result[0].drFName  + '<br />' +
				      'Address: ' + result[0].workAddress  + '<br />' +
				      'Number: ' + result[0].onCallNum
				     );
			 }
			 else
			     res.send('User does not exist.');
                     });
    
});
app.post('/add_doctor', function (req, res) {
    connection.query('INSERT INTO doctorInfo SET ?', req.body,
		     function (err, result) {
			 if (err) throw err;
			 connection.query('select DoctorID, drFName, drLName, workAddress, onCallNum from doctorInfo where drLName = ?', req.body.drLName,
					  function (err, result) {
					      if(result.length > 0) {
						  res.send('Last Name: ' + result[0].drLName + '<br />' +
							   'First Name: ' + result[0].drFName  + '<br />' +
							   'Address: ' + result[0].workAddress  + '<br />' +
							   'Number: ' + result[0].onCallNum
							  );
					      }
					      else
						  res.send('User was not inserted.');
					  });
		     }
		    );
    
});

app.post('/patients/table', function (req, res) {
    connection.query('select * from patientInfo',
		     function (err, result) {
			 if(result.length > 0) {
			     var responseHTML = '<table><tr><th>Name</th><th>Address</th><th>Number</th></tr>';
			     for (var i=0; result.length > i; i++) {
				 var id = result[i].PatientID;
				 responseHTML += '<tr>' + 
				     '<td><a href="/contact/?id=' + id + '">' + result[i].pLName + 
				     ', ' + result[i].pFName + '</a></td>' + 
				     '<td>' + result[i].homeAddress + '</td>' +
				     '<td>' + result[i].pPhoneNum + '</td>' +
				     '</tr>';
			     }
			     responseHTML += '</table>';
			     res.send(responseHTML);
			 }
			 else
			     res.send('No users exist.');
		     });        
});

app.get('/contact', function (req, res) {
    if(typeof req.query.id != 'undefined'){
        connection.query('select * from erContact where PatientID = ?', req.query.id,
                         function (err, result) {
                             if(result.length > 0) {
                                 res.send('<html><head><title></title></head><body>Last Name: ' + result[0].cLName + '<br />' +
                                          'First Name: ' + result[0].cFName  + '<br />' +
                                          'Relation: ' + result[0].relation  + '<br />' +
                                          'Number: ' + result[0].cPhoneNum + '</body></html>'
                                         );
                             }
                             else
                                 res.send('User does not exist.');
                         });

    }
});

// get all users in a <select>
app.post('/doctors/select', function (req, res) {
    connection.query('select * from doctorInfo ORDER BY drLName ASC, drFName ASC', 
		     function (err, result) {
			 var responseHTML = '<select id="doctor-list">';
			 for (var i=0; result.length > i; i++) {
			     var option = '<option value="' + result[i].DoctorID + '">' + result[i].drLName + ', ' + result[i].drFName +'</option>';
			     responseHTML += option;
			 }
			 responseHTML += '</select>';
			 res.send(responseHTML);
		     });
});

// Begin listening
app.listen(8017);
console.log("Express server listening on port %d in %s mode", app.settings.env);

