<!DOCTYPE html>
<html>
<head>
  <title>{{app.name}} - {{app.description}}</title>
  {{>metas}}
</head>
<body>
{{>header}}

<div cols="9" style="padding-right:30px">

  <main layout="margin-20 left" hidden>

    <h1 id="tituloDoForm">Adicionar um tema para boicote:</h1>

    <form id="formTopico" action="index.html" method="post" onsubmit="app.topicos.salvar(this, event)">
      <p>
        <input type="text" name="titulo" layout="fluid" placeholder="Qual o tema do boicote? Seja bem específico.">
      </p>
      <p>
        <label text="small bold" for="texto">Descrição</label>
        <textarea name="texto" layout="fluid" rows="4"></textarea>
      </p>
      <p>
        <label text="small bold" for="boicote">Como boicotar?</label>
        <textarea name="boicote" layout="fluid" rows="4"></textarea>
      </p>
      <p>
        <label text="small bold" for="tags">Palavras-chave:</label>
        <input type="text" name="tags" layout="fluid" placeholder="">
      </p>
      <p layout="fix">
        <input type="hidden" name="_id">

        <button class="escondeAoEditar" layout="left" type="submit">Iniciar boicote!</button>
        <button class="mostraAoEditar" layout="left" type="submit" hidden>Salvar</button>

        <button type="cancelar" layout="right" onclick="event.preventDefault(); app.goBack()">Cancelar</button>
      </p>
    </form>

  </main>

</div>

<aside cols="3">



</aside>

<script>
function __init () {
  if (/\/editar$/.test(location.href)) {
    document.getElementById('tituloDoForm').innerHTML = 'Editar tema:'
    app.topicos.editar(app.slug())
  } else {
    $('main').show()
  }
  $find('#formTopico input[name=tema]').focus()
}
</script>

{{>footer}}
