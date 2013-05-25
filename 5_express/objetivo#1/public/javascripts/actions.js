$(function(){
	$("#registerLink").click(function(){
		$("#loginForm").fadeOut(function(){
			$(".actions").animate({
				height: 210
			}, 150, function(){
					$("#registerForm").fadeIn();
				});
			});
		});
	
	$("#loginLink").click(function(){
		$("#registerForm").fadeOut(function(){
			$(".actions").animate({
				height: 130
			}, 150, function(){
				$("#loginForm").fadeIn();
			});
		});
	});
	
	$(".replyLink").click(function(){
		var parent = $(this).parent();
		$(this).fadeOut(function(){
			parent.animate({
				height: parent.height() + 85
			}, 150, function(){
				parent.children(".dontReplyLink").fadeIn();
				parent.children(".replyContainer").fadeIn();
			})
		});
	});
	
	$(".dontReplyLink").click(function(){
		var parent = $(this).parent();
		$(this).fadeOut(function(){
			parent.children(".replyContainer").hide().fadeOut(function(){
				parent.animate({
					height: 80
				}, 150, function(){
					parent.children(".replyLink").fadeIn();
				})
			});
		});
	});

    $(".inReplyTo").click(function(){
        var link = $(this);
        var parent = link.parent();
        console.log(parent.height(), parent.height() + 85);
        $.ajax({
            url: '/whistle/' + link.attr('rel'),
            method: 'GET',
            success: function(data){
                parent.animate({
                    height: parent.height() + 105
                }, 150, function(){
                    parent.children(".inReplyToContainer").html(data);
                });
            }
        });
    });

});
