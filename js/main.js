/*
 Our app MUST be inside an onDeviceReady() function!!! 
 Cordova must load in memory before any API calls can be made as well.
*/

// false is for references bubbling...
document.addEventListener('deviceready', onDeviceReady, false);


function onDeviceReady() {
    console.log('Cordova is ready!!!');



    // -----------------------VARIABLES-----------------------------------//
         // Create variables i.e objects for the forms
    
    const $elFmSignUp = $("#fmSignUp"),
        $elFmLogIn = $("#fmLogIn"),
        $elBtnLogOut = $("#btnLogOut"),   // Here to make sure <a href="#"> for id="btnLogOut" in Options
        $elFmSaveComic = $('#fmSaveComic'),
        $elBtnDeleteCollection = $("#btnDeleteCollection");
    const strongPassword = new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{7,})");
    let uid = localStorage.getItem("whoIsLoggedIn");

    /* Regex
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{7,})" 
        "" a string text phrase
        ^ start of string?
        (?=.*[a-z]) a-z lowercase
        (?=.*[A-Z]) A-Z uppercase
        (?=.*[0-9]) digits
        (?=.*[!@#\$%\^&\*]) spec characters
        (?=.{7,}) - at least 7 characters
    */
    /* 
        For Auto-Login ('Regular Me') feature:
        A way to keep track who last logged in
        A way to set who has logged in and
        A way to set who has logged out
        We also need to have code run as soon as the app starts without User interaction

        let is an Object that let's us change it,
        const is intended to be constant. 
        var is older js...

        When the app is new, localStorage is null b/c no one logged in
        After that, localStorage has data (email)
    */ 

    // Create new PouchDB object. The app can have as much space as available on device.
    // Can eventually connect a server. MySQL is a Relational DB, Pouch is a NoSQL DB.
    // External name is myDBofComics, Internal name is myComics
    let myDBofComics = new PouchDB('myComics');

    // Variable to keep track of which comic we clicked on for view, edit, or delete
    let selectedComic = "";

    // Variable for the take photo button
    // const $elBtnTakePhoto = $("#btnTakePhoto");

    // ------------------AUTO-LOGIN CHECKER-------------------------------//
    // Before any of the user interaction, have the app check who last logged in.
    // If someone is still logged in, 
    if(uid === null || uid === undefined || uid === false || uid === "") {
        console.log("No user logged in. Keep them at #pgWelcome");
    } else {
        console.log("A user last logged in, Keep then at #pgHome");
        console.log(uid);
        $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
        // To-do: load that user's database (PouchDB)
        // To-do: Load their first comic if saved
        // To-do: customize app for that user
        // Set an 'anchor' in the HTML that the JS can use to write their email on screen  <-- Should this occur when a user logs in?
        // 'id' in html same as '#' in JavaScript
        // 'class'  "  "        '.'    "   "
        $(".userEmail").html("Hello, " + uid);
    } // END If..Else Auto-Login checker



    // -----------------------FUNCTIONS-----------------------------------//
         // Create functions that are triggered by the event listeners

    function fnSignUp(event) {
        // Stop the default behavior: Refresh
        event.preventDefault();
        console.log("fnSignUp(event) is running");
        let $elInEmailSignUp = $("#inEmailSignUp"),
            $elInPasswordSignUp = $("#inPasswordSignUp"),
            $elInPasswordConfirmSignUp = $("#inPasswordConfirmSignUp");

        if(strongPassword.test($elInPasswordSignUp.val())) {
            console.log("Yes, password is strong, proceed");
            if($elInPasswordSignUp.val() != $elInPasswordConfirmSignUp.val()) {
                console.log("Passwords do not match!");
                window.alert("Passwords do not match! Please re-enter.");
                $elInPasswordSignUp.val("");
                $elInPasswordConfirmSignUp.val("");
            } else {
                console.log("Passwords successfully matched");
                let $tmpValInEmailSignUp = $elInEmailSignUp.val().toUpperCase(), // change to .toLowerCase() later...
                $tmpValInPasswordSignUp = $elInPasswordSignUp.val();
                if(localStorage.getItem($tmpValInEmailSignUp) === null) {
                    console.log("New user detected!");
                    localStorage.setItem($tmpValInEmailSignUp, $tmpValInPasswordSignUp);
                    window.alert("Welcome! Please log in to your account on the Log In page!");
                    $elFmSignUp[0].reset(); // This is the way to clear the entire form
                    console.log("New user " + $tmpValInEmailSignUp + " saved!");
                    $(":mobile-pagecontainer").pagecontainer("change", "#pgLogIn");                                                                           // TWG added code here      
                } else {
                    window.alert($tmpValInEmailSignUp + ", you already have an account!");
                }  // END If..Else for new/old user check
            }  // END If..Else for password matching
        } else {
            console.log("Password is weak");
            window.alert("Please enter a strong password (7 character minimum) with lowercase, uppercase, digit, and special characters.");
            $elInPasswordSignUp.val("");
            $elInPasswordConfirmSignUp.val("");
        }   // END If..Else is password is strong    
    }  // END fnSignUp()


    function fnLogIn(event) {
        event.preventDefault();
        console.log("fnLogIn(event) is running");
        let $elInEmailLogIn = $("#inEmailLogIn"),
            $elInPasswordLogIn = $("#inPasswordLogIn"),
            $tmpValInEmailLogIn = $elInEmailLogIn.val().toUpperCase(),  // change to .toLowerCase() later...
            $tmpValInPasswordLogIn = $elInPasswordLogIn.val();
        if(localStorage.getItem($tmpValInEmailLogIn) === null) {
            window.alert("Account does not exist! Please re-enter or go to Sign Up page.");
            $elFmLogIn[0].reset();                                                                                 // TWG Add code to clear out password OR clear out page to re-enter?     
        } else {
            console.log("Account DOES exist");
            if($tmpValInPasswordLogIn === localStorage.getItem($tmpValInEmailLogIn)) {    // <---- This line is correct
                console.log("Passwords DO match.");
                // Following code only relevant to jQuery Mobile
                $(":mobile-pagecontainer").pagecontainer("change", "#pgHome");
                // Set whoIsLoggedIn linked to tmpValInEmailLogIn
                localStorage.setItem("whoIsLoggedIn", $tmpValInEmailLogIn);
                $(".userEmail").html("Hello, " + $tmpValInEmailLogIn);
                // To do: show them a personalized message
                // To do: load their database
            } else {
                console.log("Wrong passowrd!");                        
                window.alert("Password incorrect! Please re-enter.");  
                $elInPasswordLogIn.val("");                                                                        // TWG Added code to clear out    
            }  // END If..Else for password match
        }  // END If..Else for checking if User Account Exists
    }  // END fnLogIn()
    
    function fnLogOut() {
        console.log("fnLogOut() is running");
        // Note: preventDefault() not needed
        switch(window.confirm("Are you sure you want to log out?")) {
            case true:
                console.log("User does want to log out");
                 // Move to pgWelcome, and clear localStorage "who is logged in"
                $(":mobile-pagecontainer").pagecontainer("change", "#pgWelcome");
                localStorage.setItem("whoIsLoggedIn", ""); 
                $elFmSignUp[0].reset();
                $elFmLogIn[0].reset();
                break;
            case false:
                console.log("User DOES NOT want to log out");
                break;
            default:
                console.log("Unknown error at log out");
                break;
        }  // END switch() to log out
    }  // END fnLogOut()
    
    function fnPrepComic() {      // Note that no event or event.preventDefault() is needed
        console.log('fnPrepComic() is running');

        let $valInTitleSaveComic = $('#inTitleSaveComic').val(),
            $valInNumberSaveComic = $('#inNumberSaveComic').val(),
            $valInYearSaveComic = $('#inYearSaveComic').val(),
            $valInPublisherSaveComic = $('#inPublisherSaveComic').val(),
            $valInNotesSaveComic = $('#inNotesSaveComic').val();

        // Read the path to the photo
        // let $valInPhotoSave = $("#inPhotoSavePath").val();

        console.log($valInTitleSaveComic, $valInNumberSaveComic, $valInYearSaveComic, $valInPublisherSaveComic, $valInNotesSaveComic);

        // Purpose of following is to bundle the data as JSON formatted object, for storage in PouchDB
        // and with a unique _id to differentiate one entry from other
        let tmpComic = {
            "_id" : $valInTitleSaveComic.replace(/\W/g,"") + $valInYearSaveComic + $valInNumberSaveComic,
            "title" : $valInTitleSaveComic,
            "number" : $valInNumberSaveComic,
            "year" : $valInYearSaveComic,
            "publisher" : $valInPublisherSaveComic,
            "notes" : $valInNotesSaveComic,
            // "photo" : $valInPhotoSave,
        };  // END of JSON bundle

        console.log(tmpComic);
        console.log(tmpComic._id);
        return tmpComic;
    }  // END fnPrepComic

    function fnSaveComic(event) {
        event.preventDefault();
        console.log("fnSaveComic(event) is running");
        let inputComic = fnPrepComic();
        myDBofComics.put(inputComic, function(failure, success) {
            if(failure) {
                console.log('Error: ' + failure.message);
                window.alert('You already saved this comic!');
            } else {
                console.log("Saved the comic: " + success.ok);
                window.alert(inputComic.title + " " + inputComic.number + " saved!");
                // To-do- play a sound or a haptic to indicate saved success
                $elFmSaveComic[0].reset();
                // Re-hide the image so a new image can be snapped
                // $("#inPhotoSaveImg").hide();
                fnViewComics();
            }  // END failure/success
        });  // END db.put()
    }  // END fnSaveComic()
    
    // Function to get data from the database to display on-screen. Not attached to an Event Listener
    function fnViewComics() {
        console.log("fnViewComics() is running");
        // Connect to the database and start retrieving the raw data. We can get one item at time with .get()
        // or a range of data, or everything with allDocs()
        // Sort the data ascending A-Z based on the _id, and retrieve the various fields prev saved
        // and deal with success or failure
        myDBofComics.allDocs(
            {"ascending":true,"include_docs":true},
            function(failure, success) {
                if(failure) {
                    console.log("Failure retrieving data: " + failure.message);
                } else {
                    console.log("Success, there is data: " + success);
                    if(success.rows[0] === undefined) {
                        $("#divViewComics").html("No data to display yet");
                    } else {
                        console.log("Comics to display: " + success.rows.length);
                        console.log("First comic: " + success.rows[0].doc._id);
                        let comicData = "<table><tr><th>Name</th><th>#</th><th>Year</th><th>Pub</th><th>Notes</th></tr>";
                        for(let i = 0; i < success.rows.length; i++) {
                            comicData += "<tr class='btnShowComicInfo' id='" + success.rows[i].doc._id + "'><td>" +
                                success.rows[i].doc.title +
                                "</td><td>" + success.rows[i].doc.number +
                                "</td><td>" + success.rows[i].doc.year +
                                "</td><td>" + success.rows[i].doc.publisher +
                                "</td><td>" + success.rows[i].doc.notes +
                                "</td></tr>";
                        }  // END for Loop
                        comicData += "</table>";
                        $("#divViewComics").html(comicData);
                    }  // END If...Else for data-checking
                }  // END If...Else for .allDocs()
            }); // END .allDocs()
    }  // END fnViewComics()

    // Function to delete the whole database
    function fnDeleteCollection() {
        console.log("fnDeleteCollection() is running");
        if(window.confirm("Warning! Are you sure you want to delete the whole collection?")) {
            console.log("User does want to delete the collection");
            if(window.confirm("Are you sure? There is NO undo!")) {
                console.log("They have confirmed a second time to delete");
                myDBofComics.destroy(function(failure, success) {
                    if(failure) {
                        console.log("Error in deleting database: " + failure.message);
                    } else {
                        console.log("Database deleted: " + success.ok);
                        myDBofComics = new PouchDB("mynewcomics");
                        // To-do reinitialize each user's database
                        fnViewComics();
                        window.alert("All comics are gone!");
                    } // END if...else of .destroy()
                }); // END .destroy()
            } else {
                console.log("They decided not to delete");
            } // END second if...else confirmation
        } else {
            console.log("They chose not to delete the collection");            
        } // END if...else confirmation
    }  // END fnDeleteCollection()

    // Function to make the info <section> popup to edit/view/delete comic. thisComic is referencing $(this)
    function fnEditComic(thisComic) {
        console.log("fnEditComic() is running: " + thisComic.context.id);
        myDBofComics.get(thisComic.context.id, function(failure, success) {
            if(failure) {
                console.log("Error getting comic: " + failure.message);
            } else {
                console.log("Success getting comic: " + success.title);
                // Populate the <form> 
                $("#inTitleEditComic").val(success.title);
                $("#inNumberEditComic").val(success.number);
                $("#inYearEditComic").val(success.year);
                $("#inPublisherEditComic").val(success.publisher);
                $("#inNotesEditComic").val(success.notes);

                // Before populating any image, check for photo
                // if(success.photo === undefined) {
                //     console.log("No photo");
                //     $("#inPhotoEditPath").hide();
                //     $("#inPhotoEditImg").hide();
                // } else {
                //     console.log("Current photo: " + success.photo);
                //     $("#inPhotoEditPath").val(success.photo);
                //     $("#inPhotoEditImg").attr("src", success.photo);
                //     $("#inPhotoEditPath").show();
                //     $("#inPhotoEditImg").show();
                // } // END photo view

                selectedComic = success._id;
            } // END if...else .get()
            // This function populates the <section> and makes it popup
            // but updating is handled by 
        }); // END .get()

        $(":mobile-pagecontainer").pagecontainer("change", "#pgComicViewEdit", {"role":"dialog"});
    } // END of fnEditComic()
   
    function fnEditComicConfirm(event) {
        event.preventDefault();
        console.log("fnEditComicConfirm() is running with: " + selectedComic);
        // Read all the <inputs> whether they changed or not, to resave the Database
        let $valInTitleEditComic = $("#inTitleEditComic").val(),
            $valInNumberEditComic = $("#inNumberEditComic").val(),
            $valInYearEditComic = $("#inYearEditComic").val(),
            $valInPublisherEditComic = $("#inPublisherEditComic").val(),
            $valInNotesEditComic = $("#inNotesEditComic").val();
        myDBofComics.get(selectedComic, function(failure, success) {
            if(failure) {
                console.log("Error: " + failure.message);
            } else {
                console.log("About to update: " + success._id, success._rev);
                myDBofComics.put(
                    {
                        "_id": success._id, 
                        "title": $valInTitleEditComic,
                        "number": $valInNumberEditComic,
                        "year": $valInYearEditComic,
                        "publisher": $valInPublisherEditComic,
                        "notes": $valInNotesEditComic,
                        "_rev": success._rev
                    },  
                    function(failure, success) {
                        if(failure) {
                            console.log("Error: " + failure.message);
                        } else {
                            console.log("Updated comic: " + success.id, success.rev);
                            fnViewComics();
                            $("#pgComicViewEdit").dialog("close");
                        } // END if...else .put()
                     }
                ); // END .put() 
            } // END if...else .get()
        }); // END .get()
    } // END fnEditComicConfirm(event)

    // Function to delete one comic
    function fnEditComicDelete() {
        console.log("fnEditComicDelete() is running");
        myDBofComics.get(selectedComic, function(failure, success) {
            if(failure) {
                console.log("Error: " + failure.message);
            } else {
                console.log("About to delete: " + success._id);
                if(window.confirm("Are you sure you want to delete this comic?")) {
                    console.log("Confirm deletion");
                    myDBofComics.remove(success, function(failure, success) {
                        if(failure) {
                            console.log("Error: " + failure.message);
                        } else {
                            console.log("Deleted comic: " + success.ok);
                            fnViewComics();
                            $("#pgComicViewEdit").dialog("close");
                        }  // END if...else .remove()
                    }); // END .remove()
                } else {
                    console.log("Canceled deletion");
                } // END .confirm()
            } // END if...else .get()
        }); // END .get()
    } // END fnEditComicDelete()

    // Function to close the view/info/edit popup
    function fnEditComicCancel() {
        console.log("fnEditComicCancel() is running ");
        $("#pgComicViewEdit").dialog("close");
    } // END fnEditComicCancel()

    fnViewComics();


    // Function to access Cordova Camera Plugin/ API
    // function fnTakePhoto() {
    //     console.log("fnTakePhoto() is running");
    //     // The following is in the documention, ie. the Cordoba code to start the camera
    //     navigator.camera.getPicture(
    //         function(success) {
    //             console.log("Got photo: " + success);
    //             $("#inPhotoSavePath").val(success);
    //             let suc_text = success
    //             // let suc_text = "./img/wallpaper.png"
    //             console.log(suc_text)
    //             $("#inPhotoSaveImg").attr("src", suc_text );
    //             $("#inPhotoSaveImg").show();
    //         },
    //         function(failure) {
    //             console.log("Photo failure: " + failure);
    //         },
    //         {
    //             quality : 50, 
    //             destinationType: Camera.DestinationType.FILE_URI,
    //             sourceType: Camera.PictureSourceType.CAMERA,
    //             encodingType: Camera.EncodingType.JPEG,
    //             mediaType: Camera.MediaType.PICTURE,          
    //             allowEdit: false,
    //             correctOrientation: true,
    //             saveToPhotoAlbum: true,
    //             saveToPhotoAlbum : true,
    //         } 
    //     ); // END .getPicture()
    // }  // END fnTakePhoto()


    // -----------------------EVENT LISTENERS-----------------------------//
         // Create event listeners to detect clicks

    $elFmSignUp.submit( function(){ fnSignUp(event); } );
    $elFmLogIn.submit( function(){ fnLogIn(event); } );
    $elBtnLogOut.on("click", fnLogOut);
    $elFmSaveComic.submit( function(){ fnSaveComic(event); } );
    $elBtnDeleteCollection.on("click", fnDeleteCollection);

    // Listener to detect which comic we clicked on, and open the popup
    // NOTE the    ***new syntax!***     Note all the above could be rewritten this say: this is a shortcut 
    // ^-- because it has to deal with dynamic content that doesn't exist at runtime
    // this is saying that anywhere you click on the table
    // tr means <tr>   .btnShowComicInfo means class = btnShowComicInfo 
    // and pass along the id to the waiting function...dynamically- $(this) means what you last clicked on ---> the for loop that created the table
    $("#divViewComics").on("click", "tr.btnShowComicInfo", function(){ fnEditComic($(this)); } );
    $("#fmEditComicInfo").submit(function() { fnEditComicConfirm(event); } );
    $("#btnDeleteComic").on("click", fnEditComicDelete);
    $("#btnEditComicCancel").on("click", fnEditComicCancel);

    // Start the camera plugin after taking the Snapshot. This is an input type button, not a .submit (the button itself already has "submit")
    // $elBtnTakePhoto.on("click", fnTakePhoto);
} // END onDeviceReady()
















/*

    // Make the app vibrate
    // navigator.vibrate([10000]);

    
    Data storage options
        Cookies - small bits of data
        localstorage - more complex data
            'supercookies'
        user-side database - most complex data (could be upgraded to cloud-based)
            PouchDB
        server-side database - most complex data, cloud-based
            MySQL
            Oracle
    JavaScript is an Object Oriented Programming (OOP) Language
    It works with objects to represent data/concepts
    There are many built-in Objects and we can create our own (i.e. variables)

    JavaScript has variety of built-in functions/methods and you can define your own
    w3Schools.com

    Capitalization is important 
    
    LocalStorage is a way to store basic data in your app by accessing the saving and loading commands
    attached to the special area of memory of your device
*/
