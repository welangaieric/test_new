window.addEventListener('DOMContentLoaded',()=>{


    $('.toast').fadeIn()
    $('#close-toast').on('click',()=>{
        $('.toast').fadeOut()

    })
  

    const modal = $('.modal')
    
    const serverUrl = 'https://konnektsmartlife.org'
    const OK = 200;
    const adminId = 'fuqv8045';
    const stationID = 0
    let display = $('.package-container')
    $('#selfService').on('click',()=>{
        console.log('ddsdsdsdsd')
        $('#glass-sec2').fadeToggle()
    })
    $.ajax({
        type:'GET',
        url:`${serverUrl}/api/hotspot/profiles/${adminId}`,
        success:function(data){
            let display = $('.grid')
             display.html('')
            // let result = data.filter(data.name=='UNLIMITED')
            // console.log(data)
            $('.grid-loader').hide()

            data.forEach((record)=>{
                let temp = `
                <div class="card">
                    <h2 class="card_title">${record.name}</h2>
                    <p class="pricing">${record.amount}<span class="small">kes/=</span></p>
                    
                    <hr>
                    <ul class="features">
                        <li><i class="bi bi-phone"></i> <strong>${record.devices} Device</strong></li>
                        <li><i class="bi bi-hourglass-top"></i> <strong>${record.name.split(' ')[0]}</strong></li>
                        <li><i class="bi bi-clock"></i> <strong>Unlimited Usage</strong></li>
                    </ul>
                    <button class="cta_btn" data-amount=${record.amount} data-name=${JSON.stringify(record.name)} data-devices=${record.devices} data-duration=${record.name.split(' ')[0]}>BUY</button>
                </div>
    
                `
                
                
                display.append(temp)
                $('.loading').hide()
                // Select all the cards
                const cards = document.querySelectorAll('.card');

                // Define the Intersection Observer
                const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    // If the card is intersecting with the viewport, add the animate class
                    if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                    } else {
                    // If the card is not intersecting, remove the animate class
                    entry.target.classList.remove('animate');
                    }
                });
                });

                // Observe each card
                cards.forEach((card) => {
                observer.observe(card);
                });

            })
            
            
            // modal.hide()
            $('.cta_btn').on('click',function(){   
                modal.fadeIn()
                $('#checkout').html('')
                scrollToTop()
                let amount = $(this).data('amount')
                let name = $(this).data('name')
                let devices = $(this).data('devices')
                let duration = $(this).data('duration')
                
                let temp2 = `
                    <legend>Checkout</legend>
                   
                    <div class="input-group">
                        <input type="number" placeholder="Phone Number" class="form-control" name="phone" id="phone" required>
                        <input type="number" maxLength="10"  hidden name="amount" required value=${amount} >
                        <input type="text" hidden name="value" required value=${JSON.stringify(name)}>


                    </div>
                    <div class="input-group checkout_action">
                        <input class="btn btn-secondary closebtn" value="Close">
                        <input type="submit" class="btn" value="Buy" id="buy">
                    </div>
                `
                $('#checkout').html(temp2)
                $('.closebtn').on('click',()=>{
                    $('#checkout').html('')
                    modal.fadeOut()
                })

                const numberRegex = /^\d{10}$/;
                const phone = $('#phone');
                const buyButton = $('#buy');
                let isRequestSent = false;

                buyButton.on('click', () => {
                    
                    const phoneNumber = phone.val();                  
                    if (!numberRegex.test(phoneNumber)) {
                        phone.addClass('error');
                        showSnackbar(`Invalid phone number`);
                        $('#buy').prop('disabled', true);
                    } else {
                        
                        $('#buy').prop('disabled', false);
                        $('#checkout').on('submit', async () => {
                            let payload = {
                                value: $('#checkout').find('input[name="value"]').val(),
                                amount: $('#checkout').find('input[name="amount"]').val(),
                                phone: $('#checkout').find('input[name="phone"]').val(),
                                type:'daraja'
                            };                       
                            console.log(payload);
                            showSnackbar(`Processing Payment Please Wait`);
                            wait()
                        
                            try {
                                if (!isRequestSent) {
                                const response = await $.ajax({
                                    type: 'POST',
                                    url: `${serverUrl}/api/hotspot/send/${adminId}`,
                                    data: payload,
                                });
                        
                                console.log(response);
                        
                                if (response.status === 400) {
                                    
                                    return;
                                }
                                isRequestSent = true;
                                
                               await checkOutIDCheck(response.checkOutId);
                                modal.hide();  
                                                             
                            }
                            if(isRequestSent==='true')
                                window.location.reload();
                            } catch (err) {
                                $('.loader3').hide();
                                showSnackbar(`Cannot Process Request At The Moment`);
                            }finally {
                                isRequestSent = false;  // Reset the flag after the request is completed
                            }          
                            async function checkOutIDCheck(checkoutId) {
                                const pollInterval = 3000; // Poll every 3 seconds 
                                const maxAttempts = 10; // Set a maximum number of attempts
                                let attempts = 0;
                                let conditionMet = false; // Flag to track whether the condition is met
                            
                                const checkStatus = async () => {
                                    try {
                                        const response = await $.ajax({
                                            type: 'post',
                                            url: `${serverUrl}/api/hotspot/check/${checkoutId}/${adminId}`,
                                        });
                            
                                        if (response.result.ResultCode === '0') {
                                            // console.log(response);
                                            showSnackbar('Payment Verified');
                                            await addUser(); 
                                            conditionMet = true; // Set the flag to true when the condition is met
                                        } else {
                                            console.log(response.result);
                                            let data = response.result
                                            conditionMet = true;
                                            showSnackbar(data.ResultDesc);
                                            // Set the flag to true when the condition is met

                                        }
                                    } catch (error) {
                                        console.error(error);
                                        showSnackbar('Retying');
                                         // Set the flag to true when the condition is met
                                         
                                    }
                                };
                            
                                const poll = async () => {
                                    if (!conditionMet && attempts < maxAttempts) {
                                        attempts++;
                            
                                        await checkStatus();
                            
                                        // Check again after a delay
                                        setTimeout(poll, pollInterval);
                                    } else {
                                        
                                            showSnackbar('Cannot Verify Payment');
                                        
                                    }
                                };
                            
                                // Start the polling process
                                await poll();
                            }
                            
                        
                            async function addUser() {

                                try {
                                    const response = await $.ajax({
                                        type: 'post',
                                        url: `${serverUrl}/api/hotspot/add-user`,
                                        data:payload
                                    });
                                    // console.log(response)
                                    if (response.status === 200) {
                                        showSnackbar('You will be logged in shortly');
                                        let pushResponse = response;
                                        console.log(pushResponse)
                                        let username = pushResponse.code;
                                        autoLogin(username);
                                    } else {
                                        showSnackbar('Invalid checkout ID');
                                    }
                                } catch (error) {
                                    console.error(error);
                                    showSnackbar('Error adding user');
                                }
                            }
                        });
                        
                    }
                });


            })
            

            $('.close').on('click',()=>{
                $('#checkout').html('')
                modal.fadeOut()
            })
        
        },
        error:function(){
          
            
               showSnackbar('Failed to fetch packages')
               let display = $('.grid')
               display.html(' <p class="package_notice"><i class="bi bi-folder-x"></i> No Packages Found</p>')
                $('.grid-loader').hide()
                
            
        }

        
    })

    $('form').on('submit',(e)=>e.preventDefault())
    $('.loader2').hide()
    $('.daily').on('click',()=>showSnackbar(`Scroll Down`))
    $('.weekly').on('click',()=>showSnackbar(`Scroll Down`))
    $('.monthly').on('click',()=>showSnackbar(`Scroll Down`))
    function showSnackbar(message = '', buttonText = '', event) {

        const snackbar = document.querySelector('.mdc-snackbar');
        document.querySelector('.mdc-snackbar__label')
            .innerHTML = `${message}`;
    
        snackbar.classList.add('show');
        setTimeout(function () {
            snackbar.classList.remove("show");
        }, 6200);

    }
    $('#self_service').on('submit',()=>{
        $.ajax({
            type:'POST',
            url:`${serverUrl}/self_service`,
            data:$('#self_service').serialize(),
            success:function(response){
                if (response.status === 200) {
                    showSnackbar('You will be logged in shortly');
                    let username = response.code;
                    autoLogin(username);
                }             
            },
            error:function(response){
                console.log(response)
                showSnackbar('Error please contact customer care')
            }

        })
    })
   
    function autoLogin(code) {
        console.log(code);
        document.getElementById('txt-code')
            .value = code;
        doLogin();
    }
   function  wait(){
    $('.wait').show()
    showSnackbar('Processing')
    setTimeout(()=>{   
        $('.wait').hide()
       
        modal.fadeOut()
        scrollToTop()
    },1000)
   }
 
  function scrollToTop(){
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
  }
  scrollToTop()

   function showModal(message){
    var modal_new = document.getElementById("myModal");
    var span = document.getElementsByClassName("close")[0];
    modal_new.style.display = "block";
    $('#notice').html(message)
    span.onclick = function() {
     modal_new.style.display = "none";
    }
  
    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal_new) {
         modal_new.style.display = "none";
      }
    }
   }
   

async function notification(){
    try {
        await $.ajax({
            type:'Get',
            url:`${serverUrl}/notifications`,
            success:function(data){
                if(data){
                    console.log(data)
                    // showSnackbar(data)
                    showModal(data)
                }
            }
        })
    } catch (error) {
        
    }
}
notification()


})
