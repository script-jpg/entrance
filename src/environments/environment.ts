// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  wsLink: 'wss://4o15cnzf6e.execute-api.us-east-2.amazonaws.com/production',
  buyCallLink: 'https://xgntrw99y4.execute-api.us-east-2.amazonaws.com',
  endCallLink: 'https://3whkvnh0bf.execute-api.us-east-2.amazonaws.com',
  setCreatorOnlineLink: 'https://qb41veanh6.execute-api.us-east-2.amazonaws.com/dev',
  endStreamLink: 'https://s9gk8af56f.execute-api.us-east-2.amazonaws.com',

  RTCPeerConfiguration: {
    iceServers: [
      {
        urls: 'stun:stun1.l.google.com:19302'
      }
    ]
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
