export function makeDraggable(element, querySelector) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.querySelector(querySelector).onmousedown = dragMouseDown;
    
    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault(); 
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault(); 
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY; 
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const elementRect = element.getBoundingClientRect(); 
        let newTop = element.offsetTop - pos2;
        let newLeft = element.offsetLeft - pos1; 
        newTop = Math.max(0, Math.min(newTop, windowHeight - elementRect.height));
        newLeft = Math.max(0, Math.min(newLeft, windowWidth - elementRect.width)); 
        element.style.top = newTop + "px";
        element.style.left = newLeft + "px";
    }
    
    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

export function makeDraggablePhoneTouch(element, querySelector) {
    let touch1 = 0, touch2 = 0, touch3 = 0, touch4 = 0;
    element.querySelector(querySelector).addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        touch3 = touch.clientX;
        touch4 = touch.clientY;
        
        function touchMove(e) {
            const touch = e.touches[0];
            e.preventDefault();
            
            touch1 = touch3 - touch.clientX;
            touch2 = touch4 - touch.clientY;
            touch3 = touch.clientX;
            touch4 = touch.clientY;
            
            const windowWidth = window.innerWidth;
            const windowHeight = window.innerHeight;
            const elementRect = element.getBoundingClientRect();
            
            let newTop = element.offsetTop - touch2;
            let newLeft = element.offsetLeft - touch1;
            
            newTop = Math.max(0, Math.min(newTop, windowHeight - elementRect.height));
            newLeft = Math.max(0, Math.min(newLeft, windowWidth - elementRect.width));
            
            element.style.top = newTop + "px";
            element.style.left = newLeft + "px";
        }
        
        function touchEnd() {
            document.removeEventListener('touchmove', touchMove);
            document.removeEventListener('touchend', touchEnd);
        }
        
        document.addEventListener('touchmove', touchMove, { passive: false });
        document.addEventListener('touchend', touchEnd);
    });
} 