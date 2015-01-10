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
				<span><?php echo $_GET['plaintext'] ?></span>
				<label>Plain text</label>
			</div>
			<div class="row">
                <span><?php echo $_GET['email'] ?></span>
                <label>Email</label>
			</div>
			<div class="row">
                <span><?php echo $_GET['website'] ?></span>
                <label>Website</label>
			</div>
			<div class="row">
                <span><?php echo $_GET['search'] ?></span>
                <label>Search</label>
			</div>
			<div class="row">
                <span><?php echo $_GET['phone'] ?></span>
                <label>Phone</label>
			</div>
			<div class="row">
                <span><?php echo $_GET['number'] ?></span>
                <label>Numbers</label>
			</div>
			<div class="row">
                <span><?php echo $_GET['list1'] ?></span>
                <label>List</label>
			</div>
			<div class="row">
                <span><?php echo $_GET['textarea'] ?></span>
                <label>Textarea</label>
			</div>
			<div class="row">
                <span><?php echo $_GET['radio'] ?></span>
                <label>Radio</label>
			</div>
			<div class="row">
                <span><?php echo ($_GET['checkbox']=='1')?'checked':'not checked' ?></span>
                <label>Checkbox</label>
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