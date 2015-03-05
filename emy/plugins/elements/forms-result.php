<section id="form-result" data-title="Results" class="panel">
	<h2>Result GET</h2>
	<fieldset>
		<?php
		foreach($_GET as $name => $value) {
			if(gettype($value)==='array') {
				$val='';
				foreach($_GET[$name] as $n => $v) {
					$val .= $v.', ';
				}
				$val = substr($val,0,-2);
			} else
				$val = $value;
		?>
		<div class="row">
			<label><?php echo $name ?></label>
			<input type="text" value="<?php echo $val; ?>" readonly>
		</div>
		<?php
		}
		?>
	</fieldset>

	<h2>Result POST</h2>
	<fieldset>
		<?php
		foreach($_POST as $name => $value) {
		?>
		<div class="row">
			<label><?php echo $name ?></label>
			<input type="text" value="<?php echo $value; ?>" readonly>
		</div>
		<?php
		}
		?>
	</fieldset>
</section>