const { response } = require("express");
var express=require("express");

var mysql=require("mysql");

var app=express();

app.listen(5007,function(){
    console.log("Server Started");
})

app.use(express.static("public"));//to server .css and .js files to client
var path=require("path");
var fileuploading=require("express-fileupload");

app.use(fileuploading());//inform nodejs about express-fileupload module
app.use(express.urlencoded({extended:true}));//used to convert post data to object in body

app.get("/index",function(req,resp){
    resp.sendFile(__dirname+"/public/index.html");
})

var dbConfigObj={
    host:"localhost",
    user:"root",
    password:"",
    database:"nodejs"
}

var dbcon=mysql.createConnection(dbConfigObj);
dbcon.connect(function(err){
    if (err)
        console.log(err.message);
    else
        console.log("Connected Sucessfully");
})



app.get("/signup-process",function(req,resp){
    console.log(req.query.signuid);

    var dt=new Date();
    var cur=dt.getDate()+"/"+dt.getMonth()+"/"+dt.getFullYear();
    req.query.dateofsignup=cur;



    //insert data
    var data=[req.query.signuid,req.query.signpwd,req.query.mobile,req.query.utype,req.query.dateofsignup];
    dbcon.query("insert into users values(?,?,?,?,?)",data,function(err){
        if (err)
            console.log(err.message);
        else
            resp.send("Saved");

        
    })

    //resp.end();
})

//=======================================================================================================

app.get("/ajax-check-uid",function(req,resp){
    console.log(req.query.kuchUid);
    dbcon.query("select * from users where uid=?",[req.query.kuchUid],function(err,res){

        resp.send(res);
    })
})

//========================================================================================================

app.get("/login-process",function(req,resp){
    dbcon.query("select * from users where uid=? and pwd=?",[req.query.uid,req.query.pass],function(err,resl){
        resp.send(resl);
    })
})

//=========================================================================================================

app.post("/save-profile",function(req,resp){
console.log(req.body.email);

if(req.files=="")
    req.body.picname="nopic.png";
    else
    {
        req.body.picname=req.files.picname.name;
        //for saving the pic itself in Uploads folder
        var uploadingPath= path.join(process.cwd(),"public","uploads",req.files.picname.name);
        req.files.picname.mv(uploadingPath,function(err){
        if(err)
           console.log(err);
           else
           console.log("Uploaded");
        });
    }


var details=[req.body.email,req.body.name,req.body.contact,req.body.address,req.body.city,req.body.acardno,req.body.picname];

    dbcon.query("insert into profiles values(?,?,?,?,?,?,?)",details,function(err){
        if (err)
            console.log(err.message);
        else
            resp.send("Saved profile details");

    })
})

//=================================================================================================================

app.post("/update-profile",function(req,resp){

    if(req.files=="")
    {
        console.log("empty");
        //req.body.picname="nopic.png";
    }
   
    else
    {
         //console.log(req.body.picname);
        req.body.picname=req.files.picname.name;
        //for saving the pic itself in Uploads folder
        var uploadingPath= path.join(process.cwd(),"public","uploads",req.files.picname.name);
        req.files.picname.mv(uploadingPath,function(err){
        if(err)
           console.log(err);
           else
           console.log("Uploaded");
        });
    }

    
    var data=[req.body.name,req.body.contact,req.body.address,req.body.city,req.body.acardno,req.body.picname,req.body.email];
    console.log(data);
    dbcon.query("update profiles set name=?,contact=?,address=?,city=?,acard=?,picname=? where email=?",data,function(err){
        if (err)
            console.log(err.message);
        else
            resp.send("Updated");
    })
})

//================================================================================================================================

app.post("/save-details",function(req,resp){

    if(req.files==""){
        req.body.picname="nopic.png";

    }
    else
    {
        req.body.picname=req.files.picname.name;
        //for saving the pic itself in Uploads folder
        var uploadingPath= path.join(process.cwd(),"public","uploads",req.files.picname.name);
        req.files.picname.mv(uploadingPath,function(err){
        if(err)
           console.log(err);
           else
           console.log("Uploaded");
        });
    }

    var medavail=[req.body.email,req.body.medname,req.body.company,req.body.expdate,req.body.unit,req.body.qty,req.body.city,req.body.picname];
    console.log(medavail);

    dbcon.query("insert into medicinestable values(null,?,?,?,?,?,?,?,?,current_date(),1)",medavail,function(err){
        if (err)
        console.log(err.message);
        else
            resp.send("Saved med details");
    })
})

//===============================================================================================================================================

app.get("/fetchMedicines",function(req,resp){
    dbcon.query("select * from medicinestable where email=?",[req.query.email],function(err,res){
        resp.send(res);
    })
})

//===============================================================================================================================================

app.get("/doDeleteProfile",function(req,resp){
    dbcon.query("delete from medicinestable where rid=?",[req.query.rid],function(err,res){
        resp.send(res);
    })
})

//================================================================================================================================================

app.get("/needy-details",function(req,resp){
    var details=[req.query.email,req.query.name,req.query.address,req.query.city,req.query.acardno];

    dbcon.query("insert into needydetails values(?,?,?,?,?)",details,function(err){
        if (err)
            console.log(err.message);
        else
            resp.send("Saved");
    })
})

//===================================================================================================================================================

app.get("/fetchCities",function(req,resp){
    dbcon.query("select  distinct city from medicinestable",function(err,res){
        resp.send(res);
    })
})


//======================================================================================================================

app.get("/fetchMed",function(req,resp){
//console.log(req.query.city);
    dbcon.query("select distinct medname from medicinestable where city=?",[req.query.city],function(err,res){
        resp.send(res);
    })
})

//======================================================================================================================


app.get("/showProvider",function(req,resp){

    console.log(req.query.selMed);
    dbcon.query("select * from medicinestable where city=? and medname=?",[req.query.selCity,req.query.selMed],function(err,res){
        resp.send(res);
    })
})

//======================================================================================================================

app.get("/fetchProviderDetails",function(req,resp){
    console.log(req.query.email)
    dbcon.query("select * from profiles where email=?",[req.query.email],function(err,res){
        resp.send(res);
    })
})