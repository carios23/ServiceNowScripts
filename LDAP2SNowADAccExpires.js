/**  
 *   This function is the Source Script in a Field Map
 *   The date when the account expires. Account-Expires attribute comes as source.u_accountexpires from LDAP
 */
answer = (function transformEntry(source) {
    var daysToExpiration = 0;
    // This value represents the number of 100-nanosecond intervals since January 1, 1601 (UTC).
    if (source.u_accountexpires == '' || source.u_accountexpires == null || source.u_accountexpires == undefined) {
        daysToExpiration = 0
    }
    else {
        //  A value of 0 or 0x7FFFFFFFFFFFFFFF (9223372036854775807) indicates that the account never expires.
        // Therefore, we assign a big number for the days.
        if (source.u_accountexpires == 0 || source.u_accountexpires == 9223372036854775807) { //
            daysToExpiration = 50000;
        }
        else {

            var now = new GlideDateTime();

            //11644473600000 is the days from Jan 1, 1601 to Jan 1, 1970. Added to match LDAP to Javascript
            // Multiply by 10000 to convert from milliseconds(js) to 100 of nanosecond (LDAP)
            //var today = (11644473600000 + now.getNumericValue()) * 10000;
              var today = 116444736000000000 + ( now.getNumericValue() * 10000 )

            // Subtract today in LDAP format and divides by the number of 100 of nanoseconds in a day.
            // daysToExpiration = (source.u_accountexpires - today) / 864000000000;
              daysToExpiration  = (source.u_accountexpires - today) / 864000000000;
            // If the account has already expired, we assign it a 0
            if (daysToExpiration < 0) {
                daysToExpiration = 0;
            }

            daysToExpiration = parseInt(daysToExpiration, 10)

            switch (daysToExpiration) {
                case 3:
                case 7:
                case 10:
                    //LDAP-disabled users are not sent an email during transform based on 'userAccountControl' attribute
                    switch (parseInt(source.u_useraccountcontrol,10)) {
                        case 514:
                        case 546:
                            break;
                        default:
                            gs.eventQueue('userid.expired', target, parseInt(daysToExpiration, 10), target.email);
                    }//inner switch
            } // end switch outer
        }

    return daysToExpiration;
}
})
(source);