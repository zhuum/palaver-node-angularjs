(function(seedData) {
	seedData.initialThreads = [
		{
			id: 1,
			parentId: 1,
			time: '2/28/2014 10:14am',
			user: 'marcus',
			message: 'more stupid shit'
		},
		{
			id: 2,
			parentId: 2,
			time: '2/28/2014 10:14am',
			user: 'marcus',
			message: 'more stupid shit'
		},
		{
			id: 3,
			parentId: 3,
			time: '2/28/2014 10:14am',
			user: 'marcus',
			message: 'more stupid shit'
		},
		{
			id: 4,
			parentId: 4,
			time: '2/28/2014 10:14am',
			user: 'marcus',
			message: 'more stupid shit'
		}
	];

	seedData.initialComments = [
		{
			id: 5,
			parentId: 1,
			time: '2/28/2014 10:14am',
			user: 'marcus',
			message: 'more stupid shit'
		},
		{
			id: 6,
			parentId: 1,
			time: '2/28/2014 10:14am',
			user: 'marcus',
			message: 'more stupid shit'
		},
		{
			id: 7,
			parentId: 1,
			time: '2/28/2014 10:14am',
			user: 'marcus',
			message: 'more stupid shit'
		},
		{
			id: 8,
			parentId: 1,
			time: '2/28/2014 10:14am',
			user: 'marcus',
			message: 'more stupid shit'
		}
	];
}) (module.exports)


/*<div class="comment">
	<div class="comment-heading">
		<span class="user">marcus</span> <span class="highlight">2/28/2014 10:14am</span> 
		<button class="right reply btn btn-primary btn-xs" data-toggle="modal" data-target="#editor">reply</button>
	</div>
	<div>
		<p>this is just a test</p>
	</div>
	<div class="comment">
		<div class="comment-heading"><span class="user">marcus</span> <span class="highlight">2/28/2014 10:14am</span> <button class="right reply btn btn-primary btn-xs" data-toggle="modal" data-target="#editor">reply</button></div>
		<div>
			<p>this is just a test</p>
		</div>
		
	</div>			    				
</div>	 */