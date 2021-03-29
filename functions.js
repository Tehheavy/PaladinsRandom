var username;
var database;
var userRef;
var users = [];
var dcRef;
var isConnected = false;
$(document).ready(function () {
    if (localStorage.getItem('name') === null) {
        username = prompt("Please write a nickname");
        username.replace(/</g, "&lt;").replace(/>/g, "&gt;");
        while (username == null || username == "") {
            username = prompt("Please write a valid nickname");
        }
        localStorage.setItem('name', username);
    }
    else {
        username = localStorage.getItem('name');
        console.log("Welcome back", username + '!');
    }
    database = firebase.database();
    firebase.database().ref('users/' + username).set({
        username: username,
        status: "online",
        champion: '0',
        team: 1,
    });
    userRef = firebase.database().ref('users/');
    userRef.on('value', function (snapshot) {
        const res = snapshot.val()
        if (!res) return;
        isConnected = true
        $('#lastRandom').text('Connected!')
        $('#scramble').removeClass('disabled')
        console.log('res', snapshot);

        console.log('res', res);
        users = [];
        $("#team1").empty();
        $("#team2").empty();
        let keys = Object.keys(res);
        console.log('keys are', keys)
        for (let i = 0; i < keys.length; i++) {
            if (res[keys[i]]?.status == "online") {
                users.push(res[keys[i]]);
                if (!res[keys[i]].username || typeof res[keys[i]]?.username != 'string') {
                    res[keys[i]].username = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
                }
                if (!res[keys[i]].champion || isNaN(parseInt(res[keys[i]]?.champion))) {
                    res[keys[i]].champion = '0';
                }
                if (!res[keys[i]].team || isNaN(parseInt(res[keys[i]]?.team)) || res[keys[i]]?.team > 2 || res[keys[i]]?.team < 1) {
                    res[keys[i]].team = 1;
                }
                let playercard = generateCard(res[keys[i]].username.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                    res[keys[i]].champion.toString().replace(/</g, "&lt;").replace(/>/g, "&gt;"));
                $("#team" + res[keys[i]].team).append(playercard);
            }
        }

    });
    var lastRollerRef = firebase.database().ref('lastRandom/');
    lastRollerRef.on('value', function (snapshot) {
        const res = snapshot.val()
        if (!res) return;
        console.log('lastroll', res);
        $('#lastRandom2').text('last scrambler:'+res.replace(/</g, "&lt;").replace(/>/g, "&gt;"))


    })
    var dcRef = firebase.database().ref("users/" + username);
    dcRef.onDisconnect().set({
        username: username,
        status: "offline",
    });
});
function generateCard(playername, champid) {
    htmltext = `
        <div class="card`+ ((playername === username) ? (" active") : ("")) + `"style="width: 18rem;">
            <div class="card-body">
                <h5 class="card-title">`+ playername.replace(/</g, "&lt;").replace(/>/g, "&gt;") + `</h5>
                <h6 class="card-subtitle mb-2 text-muted">n00b</h6>
                <img src="paladins/`+ champid + `.jpg" class="card-img-bottom" alt="paladins/0.jpg">
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
function scramble() {
    if (isConnected) {

        users = shuffleArray(users);
        for (let i = 0; i < users.length; i++) {
            let champid = (Math.floor(Math.random() * 47) + 1).toString();
            console.log("for user:" + users[i].username + " randomed:" + champid);
            let legendaryid = Math.floor(Math.random() * 3) + 1;
            users[i].champion = champid;
            if (i % 2 == 0) {
                users[i].team = 1;
            }
            else {
                users[i].team = 2;
            }
        }
        setuserdata();
    }
}
function setuserdata() {
    try {

        let temp = {};
        for (let i = 0; i < users.length; i++) {
            temp[users[i].username] = users[i];
        }
        console.log(temp);
        firebase.database().ref('users/').set(temp);
        firebase.database().ref('lastRandom/').set(username);
    } catch (e) {
        console.log('error', e)
    }

}
function reset() {
    localStorage.clear();
    location.reload();
}
