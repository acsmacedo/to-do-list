// ********************************************************************** Abrir o menu
$('.hr-menu').on('click', function() {
  $('.overlay, #menu-content').removeClass('hidden');
});

// ********************************************************************** Fechar o menu
$('.overlay, .close-menu').on('click', function() {
  $('.overlay, #menu-content').addClass('hidden');
});

// ********************************************************************** Trocar nome do usuário
$('.user input').on('blur', function(event) {
  let user = ($(event.target).val()).trim();
  let userSpan = $('#header h5 span');
  user == '' ? userSpan.text('visitante') : userSpan.text(user);

  //Gatilhos de outras funções: salva a alteração na memória
  saveUser(user);
});

// ********************************************************************** Trocar o avatar
$('.avatar span').on('click', function(event) {
  let avatar = $(event.target).clone(true);
  $('.avatar span').removeClass('avatar-selected');
  $(event.target).parent('span').addClass('avatar-selected');
  $('.hr-greeting i').remove();
  $('.hr-greeting').prepend(avatar);
  
  //Gatilhos de outras funções: salva a alteração na memória
  let avatarName = avatar.attr('class');
  let avatarNameSplit = avatarName.split(' ')[1];
  saveAvatar(avatarName, avatarNameSplit);
});

// ********************************************************************** Trocar o background
$('.img-back span').on('click', function(event) {
  let id = $(event.target).parent('span')[0].id;
  let idCompleto = `url("./assets/img/${id}.jpg")`
  $('.img-back span').removeClass('back-selected');
  $(event.target).parent('span').addClass('back-selected');
  $('body').css('background-image', idCompleto);

  //Gatilhos de outras funções: salva as alterações na memória
  saveBackground(id, idCompleto);
});

// ********************************************************************** Aceitar as instruções
function instructionsActive() {
  if ($('#menu-content .about input').hasClass('active-instruction')) {
    $('.instructions').addClass('hidden');
  } else {
    $('.instructions').removeClass('hidden');
  };
};

$('#menu-content .about input').on('click', function() {
  $('#menu-content .about input').toggleClass('active-instruction');
  instructionsActive();
  saveInstructions();
});

// ********************************************************************** Transforma o objeto Date em dd/mm/aaaa
function datePattern(data){
  let date  = data.getUTCDate().toString();
  let dateF = (date.length == 1) ? '0'+date : date;
  let month  = (data.getUTCMonth()+1).toString();
  let monthF = (month.length == 1) ? '0'+month : month;
  let yearF = data.getUTCFullYear();
  return dateF+"/"+monthF+"/"+yearF;
};

// ********************************************************************** Adicionar item-list
$('#form').on('submit', function(event) {
  event.preventDefault();
  
  //Gatilhos para outras funções: Permite inserir items em ordem invertida
  let isInvert = false;
  if($('.invert').hasClass('active-text-color')) {
    clickInvert();
    isInvert = true;
  };
  //Fim do gatilho acima
  
  let label = $('#label-form option:selected').val();
  let valDeadline = $('#deadline-form').val();
  let deadline = valDeadline != '' ? datePattern(new Date(valDeadline)) : valDeadline;
  let task = $('#task-form').val().trim() || 'Tarefa sem descrição';
  
  $('.list').append('<div class="item-list"> <div class="topic-left"> <i class="fas fa-calendar-check check"></i> <span class="deadline"></span> <span class="task"></span> </div> <div class="topic-right"> <i class="fas fa-star important"></i> <i class="fas fa-exclamation-triangle warning"></i> <i class="fas fa-times-circle close"></i> </div> </div>');

  let lastItem = $('.list .item-list:last-child');

  lastItem.find('.deadline').append(deadline);
  lastItem.find('.task').append(task);
  lastItem.addClass(label);

  $('#task-form').val('');

  //Gatilhos de outras funções: cria dados para ajudar na ordenação
  let sortCreate = Date.now();
  let sortDeadline = new Date(valDeadline).getTime() || Infinity;
  
  lastItem.attr('data-deadline', sortDeadline);
  lastItem.attr('data-create', sortCreate);
  lastItem.attr('data-label', label);
  
  //Gatilhos de outras funções: Adiciona classe warning se o item já está atrasado
  $('.list').trigger('myWarning');

  //Gatilhos de outras funções: Esconde o item se houver filtros selecionados
  $('.fil-important, .fil-warning, .fil-unchecked').trigger('click');
  $('.fil-important, .fil-warning, .fil-unchecked').trigger('click');

  //Gatilhos de outras funções: Adicione o item na ordem certa, se houver sort
  if ($('.sort-items').children().hasClass('active-text-color')) { sortActive() };
  
  //Gatilhos para outras funções: Permite inserir items em ordem invertida
  if (isInvert) { clickInvert(); };
});

// ********************************************************************** Deleta / Important / Check item
$('.list').on('click', function(event) {
  if ($(event.target).hasClass('close')) {
    $(event.target).parents('.item-list').remove();
  };

  if ($(event.target).hasClass('important')) {
    let checked = $(event.target).parents('.item-list').find('.check-color').length;
    if (checked == 0) {
      $(event.target).toggleClass('important-color');
      $(event.target).parents('.item-list').find('.task').toggleClass('task-important');

      //Gatilhos de outras funções: remove o warning de items feitos / adiciona se for desfeito
      $('.fil-important, .fil-warning, .fil-unchecked').trigger('click');
      $('.fil-important, .fil-warning, .fil-unchecked').trigger('click');
    };
  };

  if ($(event.target).hasClass('check') || $(event.target).hasClass('task')) {
    $(event.target).parents('.item-list').find('.check').toggleClass('check-color');
    $(event.target).parents('.item-list').find('.task').toggleClass('task-checked');
    
    //Gatilhos de outras funções: remove o important de items feitos
    $(event.target).parents('.item-list').find('.important').removeClass('important-color');
    $(event.target).parents('.item-list').find('.task').removeClass('task-important');

    //Gatilhos de outras funções: remove o warning de items feitos / adiciona se for desfeito
    $(event.target).parents('.item-list').find('.task').removeClass('task-warning');
    $(event.target).parents('.item-list').find('.warning').removeClass('warning-color');
    $(event.target).parents('.item-list').find('.fa-exclamation-triangle').toggleClass('warning');
    $('.list').trigger('myWarning');

    //Gatilhos de outras funções: remove o warning de items feitos / adiciona se for desfeito
    $('.fil-important, .fil-warning, .fil-unchecked').trigger('click');
    $('.fil-important, .fil-warning, .fil-unchecked').trigger('click');
  };
});

// ********************************************************************** Warning
function compareDates(deadline) {
  let now = Date.now();
  let [deadYear, deadMonth, deadDate] = [deadline.slice(6,10), deadline.slice(3,5), deadline.slice(0,2)];
  let deadlineCompare = Date.UTC(deadYear, deadMonth - 1, deadDate) + (1000 * 60 * 60 * 24);
  if (deadline != '') { return now > deadlineCompare; };
};

$('.list').on('myWarning', function() {
  $('.deadline').each(function(index, elem) {
    let deadlineText = elem.innerText;
    let compare = compareDates(deadlineText);
    
    if (compare) {
      $(this).parents('.item-list').find('.warning').addClass('warning-color')
      .parents('.item-list').find('.task').addClass('task-warning');
    } else {
      $(this).parents('.item-list').find('.warning').removeClass('warning-color')
      .parents('.item-list').find('.task').removeClass('task-warning');
    };
  });
});

// ********************************************************************** Abre e fecha filter / sort
$('.filter-title, .sort-title').on('click clickFilterSort', function(event) {
  let target = $(event.currentTarget).next();
  target.hasClass('hidden') ? target.removeClass('hidden') : target.addClass('hidden');
});

// ********************************************************************** Ativa filter / sort
function activeFilSort() {
  if($('.filter-items div').hasClass('active-text-color')) {
    $('.filter-title, filter-title span').addClass('active-text-color');
  } else {
    $('.filter-title, filter-title span').removeClass('active-text-color');
  };

  if($('.sort-items div').hasClass('active-text-color')) {
    $('.sort-title, sort-title span').addClass('active-text-color');
  } else {
    $('.sort-title, sort-title span').removeClass('active-text-color');
  };
};

$('.fil-sort').on('click', function() {
  activeFilSort();
});

// ********************************************************************** Filtro Warning
$('.fil-warning').on('click', function() {
  if($('.fil-warning').hasClass('active-text-color')) {
    $('.item-list').removeClass('hidden-exept-warning');
    $('.item-list').removeClass('show-warning');
    $('.fil-warning, .fil-warning span').removeClass('active-text-color');
  } else {
    $('.item-list').addClass('hidden-exept-warning');
    $('.warning-color').parents('.item-list').removeClass('hidden-exept-warning');
    $('.warning-color').parents('.item-list').addClass('show-warning');
    $('.fil-warning, .fil-warning span').addClass('active-text-color');
  };

  //Gatilhos de outras funções: fecha as opções de filtro
  $('.filter-title').trigger('clickFilterSort');
});

// ********************************************************************** Filtro Important
$('.fil-important').on('click', function() {
  if($('.fil-important').hasClass('active-text-color')) {
    $('.item-list').removeClass('hidden-exept-important');
    $('.item-list').removeClass('show-important');
    $('.fil-important, .fil-important span').removeClass('active-text-color');
    $('').removeClass('active-text-color');
  } else {
    $('.item-list').addClass('hidden-exept-important');
    $('.important-color').parents('.item-list').removeClass('hidden-exept-important');
    $('.important-color').parents('.item-list').addClass('show-important');
    $('.fil-important, .fil-important span').addClass('active-text-color');
  };

  //Gatilhos de outras funções: fehc as opções de filtro
  $('.filter-title').trigger('clickFilterSort');
});

// ********************************************************************** Filtro Unchecked
$('.fil-unchecked').on('click', function() {
  if($('.fil-unchecked').hasClass('active-text-color')) {
    $('.item-list').removeClass('hidden-exept-unchecked');
    $('.item-list').removeClass('show-unchecked');
    $('.fil-unchecked, .fil-unchecked span').removeClass('active-text-color');
  } else {
    $('.item-list').addClass('hidden-exept-unchecked');
    $('.check').not('.check-color').parents('.item-list').removeClass('hidden-exept-unchecked');
    $('.check').not('.check-color').parents('.item-list').addClass('show-unchecked');
    $('.fil-unchecked, .fil-unchecked span').addClass('active-text-color');
  };

  //Gatilhos de outras funções
  $('.filter-title').trigger('clickFilterSort');
});

// ********************************************************************** Gerar array ordenado
function sortArray(type) {
  let ordem = [];
  $('.item-list').each(function(index, elem) {
    ordem.push($(elem).data(type));
  });

  (type == 'deadline' || type == 'create') ?
  ordem.sort(function(a, b){return a-b}) : ordem.sort();
  
  return ordem;
};

// ********************************************************************** Ordena os itens create, deadline, color
function sortItems(type) {
  let ordem = sortArray(type);

  for(let i = 0; i < ordem.length; i++) {
    let item = $(`.item-list[data-${type}=${ordem[i]}]`).detach();
    $('.list').append(item);
  };
}

// ********************************************************************** Ordena os itens letters
function sortLetters() {
  let ordem = [];
  $('.item-list').each(function(index, elem) {
    let item = $(elem).find('.task').clone(true).text();
    let itemLower = item.toLowerCase();
    ordem.push(itemLower);
  });
  
  ordem.sort();
  
  for(let i = 0; i < ordem.length; i++) {
    $('.item-list').each(function(index, elem) {
      let item = $(elem).find('.task').clone(true).text();
      let itemLower = item.toLowerCase();
      if (ordem[i] == itemLower) {
        let el = $(elem).detach();
        $('.list').append(el);
      };
    });
  };
};

// ********************************************************************** Executa e estiliza sort Date
$('.sort-date').on('click', function() {
  if ($('.sort-date').hasClass('active-text-color')) {
    sortItems('create');
    $('.sort-date, .sort-date span, .invert, .invert span').removeClass('active-text-color');
  } else {
    sortItems('deadline');
    $('.sort-items div, .sort-items span, .invert, .invert span').removeClass('active-text-color');
    $('.sort-date, .sort-date span').addClass('active-text-color');
  };

  //Gatilhos de outras funções: fecha as opções de sort
  $('.sort-title').trigger('clickFilterSort'); 
});

// ********************************************************************** Executa e estiliza sort Color
$('.sort-color').on('click', function() {
  if ($('.sort-color').hasClass('active-text-color')) {
    sortItems('create');
    $('.sort-color, .sort-color span, .invert, .invert span').removeClass('active-text-color');
  } else {
    sortItems('label');
    $('.sort-items div, .sort-items span, .invert, .invert span').removeClass('active-text-color');
    $('.sort-color, .sort-color span').addClass('active-text-color');
  };

  //Gatilhos de outras funções: fecja as opções de sort
  $('.sort-title').trigger('clickFilterSort');
});

// ********************************************************************** Executa e estiliza sort Letter
$('.sort-letter').on('click', function() {
  if ($('.sort-letter').hasClass('active-text-color')) {
    sortItems('create');
    $('.sort-letter, .sort-letter span, .invert, .invert span').removeClass('active-text-color');
  } else {
    sortLetters();
    $('.sort-items div, .sort-items span, .invert, .invert span').removeClass('active-text-color');
    $('.sort-letter, .sort-letter span').addClass('active-text-color');
  };

  //Gatilhos de outras funções: fecha as opções de sort
  $('.sort-title').trigger('clickFilterSort');
});

// ********************************************************************** Executa o sort quando add item
function sortActive() {
  let sort = $('.sort-items div.active-text-color').attr('class');
  let sortSlice = sort.split(' ');

  if (sortSlice[0] == 'sort-letter') {
    $('.sort-letter').trigger('click');
    $('.sort-letter').trigger('click');
  } else if (sortSlice[0] == 'sort-date') {
    $('.sort-date').trigger('click');
    $('.sort-date').trigger('click');
  } else if (sortSlice[0] == 'sort-color') {
    $('.sort-color').trigger('click');
    $('.sort-color').trigger('click');
  };
};

// ********************************************************************** Inverte a ordem da lista
function reverseItems() {
  $('.item-list').each(function(index, elem) {
    let el = $(elem).detach();
    $('.list').prepend(el);
  });
};

$('.invert').on('click', function() {
  if ($('.invert').hasClass('active-text-color')) {
    reverseItems();
    $('.invert, .invert span').removeClass('active-text-color');
  } else {
    reverseItems();
    $('.invert, .invert span').addClass('active-text-color');
  };  
});

function clickInvert() {
  $('.invert').trigger('click');
};

// ********************************************************************** localStorage SET
function saveUser(userName) {
  localStorage.setItem('user', userName);
};

function saveAvatar(avatarNameComplete, avatarName) {
  localStorage.setItem('avatar', avatarName);
  localStorage.setItem('avatar-complete', avatarNameComplete);
};

function saveBackground(backgroundName, pathComplete) {
  localStorage.setItem('background', backgroundName);
  localStorage.setItem('path', pathComplete);
};

function saveItems() {
  let allItems = $('.list').html();
  if (allItems != null) {
    localStorage.setItem('items', allItems);
  };
};

function saveOptions() {
  let optionsActive = $('.fil-sort-invert').find('.active-text-color');
  if (optionsActive != null) {
    let itemsArray = [];
    optionsActive.each(function(index, elem) {
      itemsArray.push($(elem).attr('class').split(' ', 1)[0]);
    });
  
    let itemsArrayFinal = [];
  
    for (let i = 0; i < itemsArray.length; i++) {
      if(itemsArray[i] != 'active-text-color') {
        itemsArrayFinal.push(itemsArray[i]);
      };
    };

    localStorage.setItem('options', itemsArrayFinal);
  };
};

function saveInstructions() {
  let valueInstructions = $('#menu-content .about input').hasClass('active-instruction');
  localStorage.setItem('agreeInstructions', valueInstructions);
};

// ********************************************************************** localStorage GET
function addBackupStorage() {
  let userName = localStorage.getItem('user');
  if (userName != null) {
    $('.user input').val(userName);
    $('.user input').trigger('blur');
  };

  let avatarName = localStorage.getItem('avatar-complete');
  let avatarNameSplit = localStorage.getItem('avatar');
  if (avatarName != null) {
    $('.hr-greeting i').attr('class', avatarName);
    $('.avatar span').removeClass('avatar-selected');
    $(`.avatar i.${avatarNameSplit}`).parent('span').addClass('avatar-selected');
  };

  let backgroundName = localStorage.getItem('background');
  let backgroundPath = localStorage.getItem('path');
  if (backgroundName != null) {
    $('body').css('background-image', backgroundPath);
    $('.img-back span').removeClass('back-selected');
    $(`.img-back #${backgroundName}`).addClass('back-selected');
  };

  let listItems = localStorage.getItem('items');
  if (listItems != null) {
    $('.list').append(listItems);
  };

  let optionsActive = localStorage.getItem('options');
  if (optionsActive != '' && optionsActive != null) {
    let optionsActiveArray = optionsActive.split(','); 
    for(let i = 0; i < optionsActiveArray.length; i++) {
      let classItem = optionsActiveArray[i];
      $(`.${classItem}`).addClass('active-text-color');
      $(`.${classItem} span`).addClass('active-text-color');
    };
  };

  let instructionActive = localStorage.getItem('agreeInstructions');
  if (instructionActive == 'true') {
    $('#menu-content .about input').trigger('click');
  };
};

// ********************************************************************** Gatilhos gerais
$(document).ready(function() {
  $('.list').trigger('myWarning');
  addBackupStorage();
});

$('.list, #form button').on('click', function() {
  saveItems();
});

$('.fil-sort-invert').on('click', function() {
  saveOptions();
  saveItems();
});
