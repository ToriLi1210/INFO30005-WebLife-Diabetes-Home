function openForm() {
  document.getElementById("myForm").style.display = "block";
}

function closeForm() {
  document.getElementById("myForm").style.display = "none";
}

window.onload = function (){
  var btn_record = getElementById("record");
  btn_record.addEventListener('click',function() {
    input_box[0].className="input_box.open";
  })
}






// // show placeholder on date and time
// var inputDate = document.querySelector("#inputDate"); 
// var changeType = function(){ 
//   this.type= "date"; 
//   console.log(this);
// }

// var removeEvent = function () {
//   console.log(this);
//   if(this.focus){
//     this. removeEventlistener( "focus", changeType); 
//     this.removeEventlistener("blur",removeEvent) 
//   }
// }
// inputDate.addEventListener("focus",changeType); 
// inputDate.addEventListener("blur",removeEvent);

// module.exports.functions = functions;