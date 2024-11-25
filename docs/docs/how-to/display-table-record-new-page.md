---
id: display-table-record-on-new-page
title: Display Table Record Details on a New Page
---

This guide demonstrates how to display the details of a selected row from the **Table** component on a new page in ToolJet.

<div style={{paddingTop:'24px'}}>

## Build the App

Let’s get started by building the app first.

1. Drag and drop a **Table** component from the component library on the right to the canvas and set other required components.
        <img style={{marginTop:'10px'}} className="screenshot-full" src="/img/how-to/display-table-record-on-new-page/build-app.png" alt="Build the app" />
2. Now add another page inside the app using the panel on the left.
        <img style={{marginTop:'10px'}} className="screenshot-full" src="/img/how-to/display-table-record-on-new-page/add-new-page.png" alt="Add a new page" />
3. Set up the second page with the required fields and components.
        <img style={{marginTop:'10px'}} className="screenshot-full" src="/img/how-to/display-table-record-on-new-page/setup-second-page.png" alt="Setup the second page" />

</div>

<div style={{paddingTop:'24px'}}>

## Setting up Event Handlers

Now click on your **Table** component and in the properties section under Events, click on **+ New event handler**.

Enter the following parameters:
- Event: **Row Clicked**
- Action: **Set variable**
- Key: **student_id** *(Enter your desired variable name)*
- Value: `{{components.table1.selectedRow.id}}`

This event will save the student id value in the entered variable name, which can be accessed on another page to fetch related data.

<img className="screenshot-full" src="/img/how-to/display-table-record-on-new-page/set-variable.png" alt="Add event handler to set variables"/>

Again click on **+ New event handler** and enter the following parameters:

- Event: **Row Clicked**
- Action: **Switch page**
- Page: **Student Report Card** *(Select your desired page from the dropdown)*

This event will switch the page whenever a record is clicked.

<img className="screenshot-full" src="/img/how-to/display-table-record-on-new-page/switch-page.png" alt="Add event handler to switch page"/>

</div>

<div style={{paddingTop:'24px'}}>

## Displaying Details on Another Page

Now you can access the value of the variable you set in the previous page, create a new query from the bottom query panel.

Select your desired data source and select operation as **List rows**, in the filters section add a new filter, select the column name, select the operation as “equals”, and in the value section enter `{{variables.student_id}}` to access the value we set in the previous page.

Now this query will fetch all the details of the student who was selected on the last page.

<img className="screenshot-full" src="/img/how-to/display-table-record-on-new-page/query.png" alt="Add query to fetch data"/>

Again go back to your home page and add a new event handler between the previous two event handlers and enter the following parameters:

- Event: **Row Clicked**
- Action: **Run Query**
- Page: **tooljetdb2** *(Select the last added query to fetch selected student details)*

<img className="screenshot-full" src="/img/how-to/display-table-record-on-new-page/query-second.png" alt="Add query to fetch data"/>

Now to display the data you can set the default value of a text input component to `{{queries.<queryname>.data[0].<key>}}`.

**Note**: Make sure to replace *queryname* with your query name and *key* with the desired key you wish to display.

<img className="screenshot-full" src="/img/how-to/display-table-record-on-new-page/display-data.png" alt="Display data on the new page"/>

</div>