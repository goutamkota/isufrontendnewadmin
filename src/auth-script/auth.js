var allowRefresh = true;
var logOutTimer = undefined;
/* Core API's list */
const CoreAPI = {
    BASE_URL: {
        API: 'https://itpl.iserveu.tech/',
    }
}

/* Auth Config Implementation */
const AuthConfig = {
    config: {
        encodeUrl: (reqUrl, username = null) => {
            if (!username) {
                const tokenData = jwt_decode(sessionStorage.getItem('CORE_SESSION'));
                username = tokenData.sub;
            }

            return new Promise < string > ((res, rej) => {

                let bongui = new TextEncoder();
                let beetlejuice = bongui.encode("@#$jill90$=");
                crypto.subtle.importKey(
                    "raw", beetlejuice, {
                        name: "HMAC",
                        hash: "SHA-256"
                    },
                    false, ["sign"]
                ).then((bullock) => {
                    let deffl90$ty5 = 10000
                    let expiry = Date.now() + deffl90$ty5
                    let jill = btoa(Math.round(Math.random()).toString() + Date.now() + "Uio" + Math.round(Math.random()).toString());
                    let url = new URL(reqUrl);
                    let jojo = btoa(username);

                    let jojobizzare = url.pathname + expiry;
                    crypto.subtle.sign(
                        "HMAC", bullock,
                        bongui.encode(jojobizzare)
                    ).then((sec09gh7$88) => {
                        let dioadvebbt = btoa(String.fromCharCode(...new Uint8Array(sec09gh7$88)))
                        url.searchParams.set("jack", dioadvebbt)
                        url.searchParams.set("expiry", `${expiry}`)
                        url.searchParams.set('jill', jill)
                        url.searchParams.set('jojo', jojo)

                        // res(url.search);
                        res(url.href);
                    });
                });
            });
        }
    }
}


/* jwt parse implementation */
const jwt_decode = (token) => {
    const base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
};

/* auto logout */
const autoLogout = () => {
    return new Promise((res, rej) => {
        const tokenData = jwt_decode(sessionStorage.getItem('CORE_SESSION'));
        const startDate = new Date();
        const expDate = new Date(tokenData.exp * 1000);
        const session = Math.ceil((expDate - startDate));
        // Clear the Previous timeout before instatntiating another. Useful for preventing multiple instances of Timeout.
        if (logOutTimer) {
            clearTimeout(logOutTimer);
        }

        logOutTimer = setTimeout(() => {
            console.clear(); // Clear the Console.
            sessionStorage.clear();
            this.storage.clear().subscribe(() => {});
        }, session);
        res('logout');
    })
}

/* initiate Refresh token */
const initiateRefreshToken = async () => {
    allowRefresh = false;
    const encodeUrl = await AuthConfig.config.encodeUrl(`${CoreAPI.BASE_URL.API}logintokenrefresh.json`);
    encodeUrl.then(succ => {
        let res = fetch(encodeUrl, {
            method: 'post'
        });
        res.then(result => result.json())
            .then(data => {
                allowRefresh = true;
                sessionStorage.setItem('CORE_SESSION', data.token);
                autoLogout().then({

                }).catch(err => {
                    console.log(err);
                });
            }).catch(err => {
                console.log('Refresh Token Error: ', err);
            })
    }).catch(err => {
        console.log(err);
    })
}

/* Handle Authentication User */
const handleAuthenticationUser = () => {
    if (sessionStorage.getItem('CORE_SESSION')) {
        const decodeToken = jwt_decode(sessionStorage.getItem('CORE_SESSION'));
        const startDate = new Date();
        const expDate = new Date(decodeToken.exp * 1000);
        const session = Math.ceil((expDate - startDate));
        const mins = Math.floor((session / 1000) / 60);
        if (expDate <= startDate) {
            return false;
        }
        if (allowRefresh && (mins <= 10)) {
            initiateRefreshToken().then(succ => {
                return true;
            }).catch(err => {
                return false;
            });
        }
        return true;
    } else {
        return false;
    }
}

module.exports = {
    handleAuthenticationUser,
    CoreAPI,
    AuthConfig
}