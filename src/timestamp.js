/*
 * timestamp.js - create a timestamp.
 */

function pad(n){
	return n<10 ? '0'+n : n;
}

export default function get_timestamp(){
  let dt=new Date();
  let year=dt.getFullYear();
  let month=dt.getMonth();
  let day=dt.getDate();
  let hours=dt.getHours();
  let min=dt.getMinutes();
  let sec=dt.getSeconds();

 return year + pad(month + 1) + pad(day) + 'T' + pad(hours) + pad(min) + pad(sec);
}
