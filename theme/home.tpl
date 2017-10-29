<!DOCTYPE html>
<html>
<head>
  <title>{{app.name}} - {{app.description}}</title>
  {{>metas}}
</head>
<body>
{{>header}}

<a href="/auth/facebook">Login with Facebook</a>

<div cols="12">

  <div layout="margin-20 left">

    <h1>Temas debatidos</h1>

    <ul id="listaDeTopicos" layout="flat" data-template hidden>
      [[#topicos]]
      <li onclick="app.go('/tema/[[slug]]')" text="1.1em line-1.5" layout="padding-10 fix" style="border-bottom:1px solid rgba(0, 0, 0, .1)" onhover="pointer">
        <h3 text="1em bold" layout="no-margin">[[titulo]]</h3>
        <!-- <p text=".8em blue" layout="no-margin">tecmundo.com.br</p> -->
        <!-- <p text=".8em gray bold" layout="no-margin">
          <i class="material-icons" style="font-size:1.9em">&#xE316;</i>[[num_votos_sim]]
          <i class="material-icons" style="font-size:1.9em">&#xE313;</i>[[num_votos_nao]]
          <i class="material-icons" style="font-size:1.3em">&#xE0CA;</i>[[num_comentarios]]
          <i class="material-icons" style="font-size:1.3em">&#xE8A6;</i>[[num_usuarios]]
        </p> -->
      </li>
      [[/topicos]]
    </ul>

  </div>

</div>

<script>
function __init () {
  $.get('/api/topicos', function (topicos) {
    $get('listaDeTopicos').innerHTML = app.render(app.template['listaDeTopicos'], { topicos: topicos })
    $get('listaDeTopicos').removeAttribute('hidden')
  })
}
</script>

{{>footer}}
