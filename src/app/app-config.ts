import jwt_decode from 'jwt-decode';

export class NextConfig {
  public static config = {
    layout: 'vertical', // vertical, horizontal
    subLayout: '', // horizontal-2
    collapseMenu: false,
    layoutType: 'menu-dark', // menu-dark, menu-light, dark
    headerBackColor: 'header-blue', // header-default, header-blue, header-red, header-purple, header-info, header-dark
    navBrandColor: 'brand-default', // brand-default, brand-blue, brand-red, brand-purple, brand-info, brand-dark
    rtlLayout: false,
    navFixedLayout: true,
    headerFixedLayout: true,
    boxLayout: false,
  };
}

export class AuthConfig {
  public static config = {
    encodeUrl: (reqUrl: string, username: string = null) => {
        if (!username) { 
          const tokenData: {sub: string} = jwt_decode(sessionStorage.getItem('CORE_SESSION')); 
          username = tokenData.sub; 
        }
        
        return new Promise<string>((res, rej) => {
      
            let bongui = new TextEncoder();
            let beetlejuice = bongui.encode("@#$jill90$=");
            crypto.subtle.importKey(
                "raw", beetlejuice,
                { name: "HMAC", hash: "SHA-256" },
                false, [ "sign" ]
               ).then((bullock) => {
                   let deffl90$ty5 = 300000
                   let expiry = Date.now() + deffl90$ty5
                   let jill = btoa(Math.round(Math.random()).toString() + Date.now()+"Uio"+ Math.round(Math.random()).toString());
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
