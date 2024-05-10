window.addEventListener('DOMContentLoaded',()=>{
    $('#connect1').on('click',(e)=>{
        e.preventDefault()
        $('.profiles-container').addClass('showProf')
     
        $('.profiles-container').removeClass('close')
         // Function to check if the first div is out of view
         

    })
    $('#connect').on('click',()=>{
        $('#txt-code').split(' ').join('')
    })
    $('.toast').fadeIn()
    $('#close-toast').on('click',()=>{
        $('.toast').fadeOut()

    })
    $('#closeProfiles').on('click',()=>{
        $('.profiles-container').removeClass('showProf')
        $('.profiles-container').addClass('close')

    })
    const modal = $('.modal')
    
    const serverUrl = 'https://www.konnektsmartlife.net'
    const OK = 200;
    let display = $('.package-container')
    $('#selfService').on('click',()=>{
        console.log('ddsdsdsdsd')
        $('#glass-sec2').fadeToggle()
    })
    $.ajax({
        type:'GET',
        url:`${serverUrl}/api/profiles`,
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
                    <div class="payment-description">
                        <p class="main"> ${name}</p>
                        <p><i class="bi bi-hourglass-top"></i><strong>${duration}</strong></p>
                        <p><i class="bi bi-cash"></i><strong> ${amount} KSH</strong></p>
                        <p><i class="bi bi-phone"></i><strong> ${devices} DEVICES</strong></p>
                    </div>
                    <div class="payment-input-group">
                        <input type="number" placeholder="Phone Number" name="phone" id="phone" required>
                        <input type="number" maxLength="10"  hidden name="amount" required value=${amount} >
                        <input type="text" hidden name="value" required value=${JSON.stringify(name)}>


                    </div>
                    <div class="payment-input-group">
                        <input type="submit" value="BUY" id="buy">
                    </div>
                `
                $('#checkout').html(temp2)

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
                                    url: `${serverUrl}/api/hotspot/send`,
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
                                const pollInterval = 3000; // Poll every 3 seconds (adjust as needed)
                                const maxAttempts = 10; // Set a maximum number of attempts
                                let attempts = 0;
                                let conditionMet = false; // Flag to track whether the condition is met
                            
                                const checkStatus = async () => {
                                    try {
                                        const response = await $.ajax({
                                            type: 'post',
                                            url: `${serverUrl}/api/hotspot/check/${checkoutId}`,
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
            

            $('.cancel-btn').on('click',()=>{
                $('#checkout').html('')
                modal.fadeOut()
            })
        
        },
        error:function(){
            $('.profiles-container-body').append('<div class="package-container" id="container"></div>')
            
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
        $('.profiles-container').removeClass('showProf')
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
  function updateDateTime() {
    var currentDate = new Date();
    var dateString = currentDate.toDateString();
    var timeString = currentDate.toLocaleTimeString();

    var dateTimeString = dateString + ' ' + timeString;
    document.getElementById('dateTime').innerHTML = dateTimeString;
}
async function notification(){
    try {
        await $.ajax({
            type:'Get',
            url:`${serverUrl}/notifications`,
            success:function(data){
                if(data){
                    console.log(data)
                    showSnackbar(data)
                }
            }
        })
    } catch (error) {
        
    }
}
notification()
// Update the date and time every second
setInterval(updateDateTime, 1000);

// Initial update
updateDateTime();
})
   