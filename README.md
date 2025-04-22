# PR TO PO CONVERTER SYSTEM

This system is made from react as a client and Exress js and Node js as a server

## FEATURES

### HOME

In Homepage you will see the total count of the created PR, PO and IAR. There is also date and time now. There is a button for creating new PR, viewing saved PR and a Logout button.

### SAVED ENTRIES

This can be shown also if you clicked "View Saved PR" and in navigation it will be in the "Saved Entries" link. It will display the Filename, Pr number, the date it is generated and ofcourse the action buttons.

#### Buttons in Saved Entries

If the cursor focused on the button, it will show teh action it will perform or its functionalities.

- The first button is for generating PR in case you forgot to generate it. It will simply download the PR to your browser and will be saved in you local storage in "Downloads" folder.
- The second button is for showing the PO. If the PO is already generated, it will show the PO data, but if not, it will show that there is no current PO in this PR so you might want to click the button for generating the PO.
- The third button is for generating PO. The difference here is it will directly show the fill up form to make a PO.
- The fourth button will be for viewing the info that is saved in the PR.
- The fifth button is for deleting the PR of choice.

### ADD PR

This will show the form for generating PR. To add items, just hover to the last item and you will see that plus icon and it will add a new row for items. If the item is greater than or equal to 2 it will show also a "x" icon which indicate that you can remove the item if you want.

#### AUTOMATIC PR NUMBER GENERATION

The PR number is automatically generated based on the generated PR saved on the database. It will count the previous entries.
The format of the PR number is "YYYY-MM-PR_COUNT". The year and month will be the current timestamp.

### ADD PO

The PO number is automatically generated based on the generated PR saved on the database. It will count the previous entries.
The format of the PR number is "YYYY-MM-PO_COUNT". The year and month will be the current timestamp.

Add PO can be found on the "Saved Entries" Page. It can be the second and the third button.

## LIMITATIONS

Autentication is just a generic email and password that is define in the front end. Forbidded page will pop up if you refresh the page but if you are not authenticated you will be redirect in the authentication page and if authenticated, you will be in the same page. The IAR is not yet implemented. Can generate only in PDF format in both PO and PR generation.

##
