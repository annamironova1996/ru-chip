var funcDefined = function(e) {
    return "function" == typeof e
}, readyDOM = function(e) {
    "loading" !== document.readyState ? e() : document.addEventListener("DOMContentLoaded", e)
};

typeofExt = function (item) {
  const _toString = Object.prototype.toString;
  return _toString.call(item).slice(8, -1).toLowerCase();
};

BX.addCustomEvent('onSubmitForm', function (eventdata) {
	try {
		if (
      typeof eventdata === 'object' &&
      eventdata &&
      eventdata.form
    ) {
      if (!(eventdata.form instanceof Node)) {
        eventdata.form = eventdata.form[0];
      }

      (new Promise((resolve, reject) => {
        if (BX.Kdelo?.Captcha) {
          BX.Kdelo.Captcha.onSubmit(eventdata).then((result) => {
            resolve(result);
          }).catch((e) => {
            reject(e);
          });

          return;
        }

        resolve(true);
      })).then((result) => {
        if (result) {
          eventdata.form.submit();
          if (eventdata.form.closest('.form_wr')) {
            eventdata.form.closest('.form_wr').classList.add('sending');
          }
        }
      });
		}
	}
	catch (e) {
		console.error(e);
	}
});

$(function(){
	
	const dynamicMask = IMask(
      document.getElementById('INLINE_CONTACT'),
      {
        mask: [
          {
            mask: '+{7} (000) 000-00-00'
          },
          {
            mask: /^\S*@?\S*$/
          }
        ]
      }
    ).on('accept', function() {
      // document.getElementById('dynamic-value').innerHTML = dynamicMask.masked.unmaskedValue || '-';
    });
	
	$.extend($.validator.messages, {
		required: BX.message("JS_REQUIRED"),
		email: BX.message("JS_FORMAT"),
		equalTo: BX.message("JS_PASSWORD_COPY"),
		minlength: BX.message("JS_PASSWORD_LENGTH"),
		remote: BX.message("JS_ERROR"),
	});
	
	$.validator.addMethod(
		"regexp",
		function (value, element, regexp) {
		var re = new RegExp(regexp);
			return this.optional(element) || re.test(value);
		},
		BX.message("JS_FORMAT")
	);
	
	$.validator.addMethod(
	  "captcha",
	  function (value, element, params) {
		let $sid = $(element).closest("form").find('input[name="captcha_sid"]');
		if (!$sid.length) {
		  $sid = $(element).closest("form").find('input[name="captcha_code"]');
		}

		let sid = $sid.val();
		
		return $.validator.methods.remote.call(this, value, element, {
		  url: arSiteOptions["SITE_DIR"] + "ajax/check-captcha.php",
		  type: "post",
		  data: {
			captcha_word: value,
			captcha_sid: sid,
		  },
		});
	  },
	  BX.message("JS_ERROR")
	);
	
	$.validator.addMethod(
	  "recaptcha",
	  function (value, element, param) {
		if (BX.Kdelo?.Captcha) {
		  return BX.Kdelo.Captcha.validate(element);
		}

		return true;
	  },
	  BX.message("JS_RECAPTCHA_ERROR")
	);
	
	$.validator.addClassRules({
	confirm_password: {
	  equalTo: "input.password",
	  minlength: 6,
	},
	password: {
	  minlength: 6,
	},
	captcha: {
	  captcha: "",
	},
	recaptcha: {
	  recaptcha: "",
	},
  });
  
  $.validator.setDefaults({
  highlight: function (element) {
    $(element).parent().addClass("error");
  },
  unhighlight: function (element) {
    $(element).parent().removeClass("error");
  },
  errorPlacement: function (error, element) {
    let afterThis = $(element[0].closest('.uploader') || element[0].closest('.iti') || element[0]);
    error.insertAfter(afterThis);
  },
});
})