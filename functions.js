var username;
var database;
var userRef;
var users=[];
var dcRef;
$(document).ready(function(){
    if(localStorage.getItem('name')===null){
        username=prompt("Please write a nickname");
        while(username==null || username==""){
            username=prompt("Please write a valid nickname");
        }
        localStorage.setItem('name',username);
    }
    else{
        username=localStorage.getItem('name');
        console.log("Welcome back",username+'!');
    }
    database = firebase.database();
    firebase.database().ref('users/' + username).set({
        username: username,
        status:"online",
        champion:'0',
        team:1,
    });
    userRef= firebase.database().ref('users/');
    userRef.on('value', function(snapshot) {
        console.log(snapshot.val());
        users=[];
        $("#team1").empty();
        $("#team2").empty();
        let keys=Object.keys(snapshot.val());
        for(let i=0;i<keys.length;i++){
            if(snapshot.val()[keys[i]].status=="online"){
                users.push(snapshot.val()[keys[i]]);
                let playercard=generateCard(snapshot.val()[keys[i]].username,
                    snapshot.val()[keys[i]].champion);
                    $("#team"+snapshot.val()[keys[i]].team).append(playercard);
            }
        }

    });
    var dcRef = firebase.database().ref("users/"+username);
    dcRef.onDisconnect().set({
        username:username,
        status:"offline",
    });
});
function generateCard(playername,champid){
    htmltext=`
        <div class="card" style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">`+playername+`</h5>
                <h6 class="card-subtitle mb-2 text-muted">n00b</h6>
                <img src="paladins/`+champid+`.jpg" class="card-img-bottom" alt="paladins/0.jpg">
            </div>
        </div>
    `
    return htmltext;
}
// used for scrambling teams
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function scramble(){
    users=shuffleArray(users);
    for(let i=0;i<users.length;i++){
        let champid = Math.floor(Math.random() * 41)+1;
        console.log("for user:"+users[i].username+" randomed:"+champid);
        let legendaryid = Math.floor(Math.random() * 3)+1;
        users[i].champion=champid;
        if(i%2==0){          
            users[i].team=1;
        }
        else{
            users[i].team=2;
        }
    }
    setuserdata();
}
function setuserdata(){
    let temp= {};
    for(let i=0;i<users.length;i++){
        temp[users[i].username]=users[i];
    }
    console.log(temp);
    firebase.database().ref('users/').set(temp);

}