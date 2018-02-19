//Sets up buttons and binds their actions
document.addEventListener('DOMContentLoaded', function() {
  bindButton('/insert', 'addSubmit');
  bindButton('/update', 'update');
  var cb = document.getElementById('cancel');
  disable(cb);
  var ub = document.getElementById('update');
  disable(ub);
  
  //Done if no entries in table
  if (document.getElementById('wkotab').firstElementChild == null)
  {
    return;
  }
  
  //Bind actions to all edit and delete buttons
  var lastRow = document.getElementById('wkotab').lastElementChild.id.slice(3);
  for (var x = 0; x <= lastRow; x++)
  {
    if (document.getElementById('row' + x) !== null)
    {
      bindButton('/delete', 'delete' + x);
      bindEditButton(x);
    }
  }
});  

//Binds the edit action for each edit button
function bindEditButton(rowNum)
{
  var fDiv = document.getElementById('woAdd');

  var wf = document.getElementById('wf');
  var lwb = wf = document.getElementById('addSubmit');
  var ub = wf = document.getElementById('update');
  var cb = wf = document.getElementById('cancel');

  //Repurposes the form at the top for updating a row instead of adding one
  document.getElementById('edit' + rowNum).addEventListener('click', 
  function(event){
    document.getElementById('fh').textContent = "Edit Workout";
    ub.value = rowNum;
    var inputs = fDiv.getElementsByTagName('fieldset');
    var thisRow = document.getElementById('row' + rowNum);
    var cells = thisRow.children;

    //Assigns initial values to all form inputs
    for (var i = 0; i < 3; i++)
    {
      if (i == 1)
      {
        inputs[i].firstElementChild.value = document.getElementById('d' + rowNum).value;
      }
      else
      {
        inputs[i].firstElementChild.value = cells[i].textContent;
      }
    }
    inputs[3].firstElementChild.value = document.getElementById('w' + rowNum).value;

    if (cells[3].textContent.includes("lbs"))
    {
      inputs[4].children[1].checked = true;
    }
    else
    {
      inputs[4].children[2].checked = true;
    }
    
    //Switch which buttons are enabled
    enable(ub);
    disable(lwb);
    enable(cb);
    
    //Event listeners to flip form back when cancel or submit is pressed
    cb.addEventListener('click', function(event) {
      disable(ub);
      enable(lwb);
      disable(cb);
      document.getElementById('fh').textContent = "Record a Workout";
      document.getElementById('update').value = 0;
      event.preventDefault();
    });
    
    ub.addEventListener('click', function(event) {
      disable(ub);
      enable(lwb);
      disable(cb);
      document.getElementById('fh').textContent = "Record a Workout";
      document.getElementById('update').value = 0;
      event.preventDefault();
    });
    
    event.preventDefault();
  });
}

//Disables a button and changes its style
function disable(btn)
{
    btn.disabled = true;
    btn.style.backgroundColor = "#aad";
    btn.style.cursor = "default";
}

//Enables a button and changes its style
function enable(btn)
{
    btn.disabled = false;
    btn.style.backgroundColor = "#33d";
    btn.style.cursor = "pointer";
}

//Binds certain actions to a button based on its id (delete, add, update)
function bindButton(extension, buttonId)
{
  document.getElementById(buttonId).addEventListener('click', function(event){
    var req = new XMLHttpRequest();
    var row = document.getElementById(buttonId).value;
    if (extension == "/delete")
    {
      row = document.getElementById(buttonId + 'i').value;
    }

    //Add to the URL extension and submit GET request
    var add = completeURL(extension, row);
    req.open('GET', extension + add, true);
    req.addEventListener('load', function(){
      if(req.status >= 200 && req.status < 400){
        var response = JSON.parse(req.responseText);
        responseAction(extension, response);
      }
      else
      {
        console.log("Error in network request: " + req.statusText);
      }
    });
    req.send(null);
    event.preventDefault();
  });
}

//Adds query data to url
function completeURL(ext, id)
{
  var idAdd = "";
  switch(ext)
  {
    case '/delete': //Add id to the query
    {
      var query = "?id=" + id;
      return query;
    }
    //This executes in addition to the below
    case '/update':
    {
      idAdd = "&id=" + id;
    }
    //Adds form data to the query
    case '/insert':
    {
      var form = document.getElementById('woAdd');
      var query = "?name=" + form.children[0].children[0].value;
      for (var i = 1; i < form.children.length - 1; i++)
      {
        var field = form.children[i].children[0];
        if (field.value !== "")
        {
            query += "&" + field.name + "=" + field.value;
        }
      }
      if (form.children[4].children[1].checked)
      {
          query += "&lbs=1" + idAdd;
      }
      else
      {
          query += "&lbs=0" + idAdd;
      }
      console.log(ext + query);
      return query;
    }
  }
}

//Completes action based on server response
function responseAction(ext, response)
{
  switch(ext)
  {
    case '/delete': //Delete row indicated by response
    {
      var delRow = document.getElementById('row' + response);
      var table = delRow.parentNode;
      table.removeChild(delRow);
      break;
    }
    
    case '/insert':  //Insert row with an id indicated by response
    {
      var newRow = document.createElement('tr');
      var r = response;
      newRow.id = 'row' + r.id;
      document.getElementById('wkotab').appendChild(newRow);
      
      //Add response data to the row
      for (var key in r) {
        if (r.hasOwnProperty(key) && key !== 'id')
        {
          if (key == 'lbs')
          {
            break;
          }
          var cell = document.createElement('td');
          cell.textContent = r[key];
          if (key == 'weight')
          {
            cell.textContent += ' ' + r.units;
          }
          newRow.appendChild(cell);
        }
      }

      //Add edit and delete buttons to the row
      var eButton = newRowButton(newRow, 'edit', r.id);
      eButton.textContent = "Edit";
      bindEditButton(r.id);

      var dButton = newRowButton(newRow, 'delete', r.id);
      dButton.textContent = "Delete";
      bindButton('/delete', dButton.id);
      
      //Add hidden data for weight (number only) and date (yyyy-mm-dd format)
      var hForm = document.createElement('form');
      newRow.appendChild(hForm);
      var input = document.createElement('input');
      input.type = "hidden";
      input.id = "w" + r.id;
      input.value = r.weight;
      hForm.appendChild(input);
      input = document.createElement('input');
      input.type = "hidden";
      input.id = "d" + r.id;
      input.value = r.date;
      hForm.appendChild(input);

      break;
    }
    case '/update':  //Update the row indicated by response
    {
      var r = response;
      console.log(response);
      var row = document.getElementById('row' + r.id);
      var i = 0;
      //Loop through response data and assign values to row
      for (var key in r) {
        if (r.hasOwnProperty(key) && key !== 'id')
        {
          if (key == 'lbs')
          {
            break;
          }
          cell = row.children[i];
          cell.textContent = r[key];
          if (key == 'weight')
          {
            cell.textContent += ' ' + r.units;
          }
          i++;
        }
      }
      document.getElementById('d' + r.id).value = r.date;
      document.getElementById('w' + r.id).value = r.weight;
      
      break;
    }
  }
}

//Creates a form with a hidden input and a button
function newRowButton(row, label, rNum)
{
  var cell = document.createElement('td');
  row.appendChild(cell);
  var bForm = document.createElement('form');
  cell.appendChild(bForm);
  var input = document.createElement('input');
  input.type = "hidden";
  input.id = label + rNum + "i";
  input.value = rNum;
  bForm.appendChild(input);
  var btn = document.createElement('button');
  bForm.appendChild(btn);
  btn.id = label + rNum;
  
  return btn;
}

