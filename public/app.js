$(document).ready(() => {
  $.get('/scrape', data => {
    console.log(data);
  })
})

$.getJSON('/articles', data => {
  for (var i = 0; i < data.length; i++) {
    $('#articles').append(`<img src='${data[i].image}'><p data-id='${data[i]._id}'>${data[i].title}</p><a href=${data[i].link} target='_blank'>CLICK HERE TO READ IT</a><br style="clear:both" />`);
  }
});

$(document).on('click', 'p', (event) => {
  event.preventDefault();
  $("#notes").empty();
  const thisId = $(event.target).attr('data-id');
  console.log(thisId);

  $.ajax({
    method: 'GET',
    url: `/articles/${thisId}`,
    success: (data) => {
      console.log(data);
      $('#notes').append(`<h2>${data.title}</h2>`);
      $('#notes').append(`<input id='titleinput' name='title' placeholder='Title of Note'>`);
      $('#notes').append(`<textarea id='bodyinput' name='body' placeholder='Body of Note'></textarea>`);
      $('#notes').append(`<button data-id='${data._id}' id='savenote'>Save Note</button>`);
  
      if (data.note) {
        $('#titleinput').val(data.note.title);
        $('#bodyinput').val(data.note.body);
      }
    }
  });
});

$(document).on('click', '#savenote', (event) => {
  event.preventDefault
  const thisId = $(event.target).attr('data-id');

  $.ajax({
    method: 'POST',
    url: `/articles/${thisId}`,
    data: {
      title: $('#titleinput').val(),
      body: $('#bodyinput').val()
    }
  })
    .then((data) => {
      console.log(data);
      $('#notes').empty();
    });

  $('#titleinput').val('');
  $('#bodyinput').val('');
});