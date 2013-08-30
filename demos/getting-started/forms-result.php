<?php
if(isset($_GET['var1']) && isset($_GET['var2']))
{
?>
	<section id="form-result" data-title="GET result" class="panel">
		<h2>Result</h2>
		<fieldset>
			<div class="row">
				<p>
					Var 1: <?php echo $_GET['var1'] ?>
				</p>
			</div>
			<div class="row">
				<p>
					Var 2: <?php echo $_GET['var2'] ?>
				</p>
			</div>
		</fieldset>
	</section>
<?php
}
elseif(isset($_POST['var1']) && isset($_POST['var2']))
{
?>
	<section id="form-result" data-title="POST result" class="panel">
		<h2>Result</h2>
		<fieldset>
			<div class="row">
				<p>
					Var 1: <?php echo $_POST['var1'] ?>
				</p>
			</div>
			<div class="row">
				<p>
					Var 2: <?php echo $_POST['var2'] ?>
				</p>
			</div>
		</fieldset>
	</section>
<?php
} elseif(isset($_GET['plaintext']) && isset($_GET['email'])) {
?>
	<section id="form-result" data-title="GET result" class="panel">
		<h2>Result</h2>
		<fieldset>
			<div class="row">
				<label>Plain text</label>
				<span><?php echo $_GET['plaintext'] ?></span>
			</div>
			<div class="row">
        <label>Email</label>
        <span><?php echo $_GET['email'] ?></span>
			</div>
			<div class="row">
        <label>Website</label>
        <span><?php echo $_GET['website'] ?></span>
			</div>
			<div class="row">
        <label>Search</label>
        <span><?php echo $_GET['search'] ?></span>
			</div>
			<div class="row">
        <label>Phone</label>
        <span><?php echo $_GET['phone'] ?></span>
			</div>
			<div class="row">
        <label>Numbers</label>
        <span><?php echo $_GET['number'] ?></span>
			</div>
			<div class="row">
        <label>List</label>
        <span><?php echo $_GET['list1'] ?></span>
			</div>
			<div class="row">
        <label>Textarea</label>
        <span><?php echo $_GET['textarea'] ?></span>
			</div>
			<div class="row">
        <label>Radio</label>
        <span><?php echo $_GET['radio'] ?></span>
			</div>
			<div class="row">
        <label>Checkbox</label>
        <span><?php echo ($_GET['checkbox']=='1')?'checked':'not checked' ?></span>
			</div>
		</fieldset>
	</section>
<?php
} else {
?>
  <section id="result" data-title="Result">
    empty result
  </section>
<?php
}
?>