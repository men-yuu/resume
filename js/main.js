const overlay = document.querySelector('.overlay:not(.case-study)');
const profileContainer = document.querySelector('.container-profile-img');
const contactText = document.querySelector('.container-profile-contact div:last-child');
const closeButton = document.querySelector('.close');


// Scroll lock + overlay helpers
let openOverlayCount = 0;
function lockBodyScroll() {
    document.documentElement.style.overflow = 'hidden';
}
function unlockBodyScroll() {
    document.documentElement.style.overflow = '';
}

function showOverlayElement(el) {
    if (!el) return;
    if (el.classList && el.classList.contains('hidden')) {
        // Remove `hidden` so transitions can run, then add `is-open` to animate
        el.classList.remove('hidden');
        // Force a reflow so the transition will occur
        // Force a reflow so the transition will occur
        el.getBoundingClientRect();
        el.classList.add('is-open');
        openOverlayCount = Math.max(0, openOverlayCount) + 1;
        if (openOverlayCount === 1) lockBodyScroll();
    } else if (el.classList && !el.classList.contains('is-open')) {
        // If it was visible but not flagged open, mark it open and count it
        el.classList.add('is-open');
        openOverlayCount = Math.max(0, openOverlayCount) + 1;
        if (openOverlayCount === 1) lockBodyScroll();
    }
}

function hideOverlayElement(el) {
    if (!el) return;
    if (el.classList && !el.classList.contains('hidden')) {
        // If element is currently opened (has transition), remove open flag to start exit animation
        if (el.classList.contains('is-open')) {
            el.classList.remove('is-open');

            let _finished = false;
            const finishHide = (ev) => {
                if (_finished) return;
                // Only handle events for this element
                if (ev && ev.target !== el) return;
                // If the element was reopened while this hide was pending, bail out
                if (el.classList.contains('is-open')) {
                    _finished = true;
                    el.removeEventListener('transitionend', finishHide);
                    return;
                }

                _finished = true;
                el.removeEventListener('transitionend', finishHide);
                if (!el.classList.contains('hidden')) {
                    el.classList.add('hidden');
                    openOverlayCount = Math.max(0, openOverlayCount - 1);
                    if (openOverlayCount === 0) unlockBodyScroll();
                }
            };

            // Listen for transition end, but also provide a timeout fallback
            el.addEventListener('transitionend', finishHide);
            setTimeout(() => finishHide(), 600);
        } else {
            // No open flag — hide immediately
            el.classList.add('hidden');
            openOverlayCount = Math.max(0, openOverlayCount - 1);
            if (openOverlayCount === 0) unlockBodyScroll();
        }
    }
}

// Functions for contact overlay (kept for existing handlers)
const openModal = () => showOverlayElement(overlay);
const closeModal = () => hideOverlayElement(overlay);

// Event Listeners
profileContainer.addEventListener('click', openModal);
contactText.addEventListener('click', openModal);
closeButton.addEventListener('click', closeModal);

// Optional: Close modal when clicking outside (contact overlay)
overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
        closeModal();
    }
});

// Optional: Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
        closeModal();
    }
});

// Close topmost visible overlay (including case-study) with Escape
document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const visibleOverlays = Array.from(document.querySelectorAll('.overlay:not(.hidden)'));
    if (visibleOverlays.length === 0) return;
    const topmost = visibleOverlays.at(-1);
    hideOverlayElement(topmost);
});

// Role details interaction
const roleItems = document.querySelectorAll('.wrapper-role');
const roleDetails = document.querySelectorAll('.role-detail');
const initialContent = document.querySelectorAll('#about .section-detail > h2, #about .section-detail > h4');
const notificationContent = document.querySelector('.notification');

// Hide all role details initially
roleDetails.forEach(detail => detail.style.display = 'none');

// Function to show role details
function showRoleDetails(roleId) {
    // Hide all initial content elements
    initialContent.forEach(element => element.style.display = 'none');
    if (notificationContent) notificationContent.style.display = 'none';

    // Hide all role details
    roleDetails.forEach(detail => detail.style.display = 'none');

    // Show corresponding role detail
    const correspondingDetail = document.querySelector(`.role-detail[data-role="${roleId}"]`);
    if (correspondingDetail) {
        correspondingDetail.style.display = 'block';
    }
}

// Function to restore initial content
function restoreInitialContent() {
    if (!document.querySelector('.wrapper-role.active')) {
        roleDetails.forEach(detail => detail.style.display = 'none');
        initialContent.forEach(element => element.style.display = 'block');
        if (notificationContent) notificationContent.style.display = 'block';
    }
}

// Toggle visibility of <span> labels inside the experience buttons
function toggleButtonSpanVisibility(selectedButton) {
    const buttons = document.querySelectorAll('.experience-all, .experience-work, .experience-education');
    buttons.forEach(b => {
        const span = b.querySelector('span');
        if (!span) return;
        if (selectedButton && b === selectedButton) {
            span.classList.remove('experience-hidden', 'hidden');
        } else {
            span.classList.add('experience-hidden', 'hidden');
        }
    });
}

// Function to deactivate all items and restore initial content
function deactivateAndRestore() {
    roleItems.forEach(r => r.classList.remove('active'));
    document.querySelector('ul.role').classList.remove('role-active');
    restoreInitialContent();
    // Keep span visibility in sync with the currently selected experience button
    const currentSelectedButton = document.querySelector('.experience-all.selected, .experience-work.selected, .experience-education.selected');
    toggleButtonSpanVisibility(currentSelectedButton);
}

// Add event listeners to role items
roleItems.forEach(item => {
    item.addEventListener('click', () => {
        // Remove active class from all items
        roleItems.forEach(r => r.classList.remove('active'));

        // Add active class to clicked item
        item.classList.add('active');

        // Add class to parent for dimming effect
        document.querySelector('ul.role').classList.add('role-active');

        // Show corresponding role details
        const roleId = item.dataset.role;
        showRoleDetails(roleId);
    });

    // Hover events
    item.addEventListener('mouseenter', () => {
        roleItems.forEach(r => {
            if (r !== item && !r.classList.contains('active')) {
                r.style.opacity = '0.3';
            }
        });

        // Show role details on hover if no item is active
        if (!document.querySelector('.wrapper-role.active')) {
            const roleId = item.dataset.role;
            showRoleDetails(roleId);
        }
    });

    item.addEventListener('mouseleave', () => {
        roleItems.forEach(r => {
            if (!r.classList.contains('active')) {
                r.style.opacity = '1';
            }
        });

        // Restore initial content only if no item is active
        restoreInitialContent();
    });
});

// Close when clicking outside
document.addEventListener('click', (e) => {
    // Don't restore if clicking within section-detail or on a role item
    const isClickInSectionDetail = e.target.closest('#about .section-detail');
    const isClickOnRole = e.target.closest('.wrapper-role');
    const isClickInExperience = e.target.closest('#experience');

    // Also ignore clicks that happen inside the experience controls/area
    if (!isClickInSectionDetail && !isClickOnRole && !isClickInExperience) {
        deactivateAndRestore();
    }
});

// Close with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        deactivateAndRestore();
    }
});

// Experience filter buttons
const btnAll = document.querySelector('.experience-all');
const btnWork = document.querySelector('.experience-work');
const btnEducation = document.querySelector('.experience-education');

function clearSelectedButtons() {
    [btnAll, btnWork, btnEducation].forEach(b => {
        if (b) b.classList.remove('selected');
    });
}

function filterRoles(filter) {
    // Deactivate any active selection and restore initial content
    deactivateAndRestore();

    roleItems.forEach(item => {
        const isWork = item.classList.contains('role-work');
        const isEdu = item.classList.contains('role-education');

        if (filter === 'all') {
            item.style.display = '';
        } else if (filter === 'work') {
            item.style.display = isWork ? '' : 'none';
        } else if (filter === 'education') {
            item.style.display = isEdu ? '' : 'none';
        }
    });
}

if (btnAll) {
    btnAll.addEventListener('click', () => {
        clearSelectedButtons();
        btnAll.classList.add('selected');
        toggleButtonSpanVisibility(btnAll);
        filterRoles('all');
    });
}

if (btnWork) {
    btnWork.addEventListener('click', () => {
        clearSelectedButtons();
        btnWork.classList.add('selected');
        toggleButtonSpanVisibility(btnWork);
        filterRoles('work');
    });
}

if (btnEducation) {
    btnEducation.addEventListener('click', () => {
        clearSelectedButtons();
        btnEducation.classList.add('selected');
        toggleButtonSpanVisibility(btnEducation);
        filterRoles('education');
    });
}

// Normalize the span labels inside experience buttons so they can be animated
document.querySelectorAll('.experience-all span, .experience-work span, .experience-education span').forEach(s => {
    // Remove the global `.hidden` used elsewhere (overlays) so it doesn't block animations
    s.classList.remove('hidden');
    // Start hidden by default; JS will reveal the selected one
    s.classList.add('experience-hidden');
});

// Sync span visibility to the initially selected button (if any)
const initiallySelected = document.querySelector('.experience-all.selected, .experience-work.selected, .experience-education.selected');
toggleButtonSpanVisibility(initiallySelected);

// Generic modal open/close by `data-modal` → element `id`
function openModalById(id) {
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    // If the target itself is an overlay, show it (and lock scroll)
    if (target?.classList?.contains('overlay')) {
        showOverlayElement(target);
        return;
    }

    // Otherwise, if it's inside an overlay, show its overlay ancestor
    const overlayAncestor = target.closest('.overlay');
    if (overlayAncestor) {
        showOverlayElement(overlayAncestor);
        return;
    }

    // If neither, simply show the element (no overlay wrapper)
    if (target?.classList) showOverlayElement(target);
}

// Attach to buttons with `data-modal` inside work highlights (or anywhere)
document.querySelectorAll('button[data-modal]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = btn.dataset.modal;
        if (!modalId) return;
        // If the target is a case-study overlay, use the case-study opener
        const target = document.getElementById(modalId);
        if (target?.classList?.contains('case-study')) {
            // Use the case-study navigation opener if available
            if (typeof openCaseStudy === 'function') {
                openCaseStudy(modalId);
            } else {
                openModalById(modalId);
            }
        } else {
            openModalById(modalId);
        }
    });
});

// Close handlers for any overlay's close button
document.querySelectorAll('.overlay .close').forEach(cb => {
    cb.addEventListener('click', () => {
        const ov = cb.closest('.overlay');
        if (ov) hideOverlayElement(ov);
    });
});

// Close overlays by clicking on the backdrop for all overlays
document.querySelectorAll('.overlay').forEach(ov => {
    ov.addEventListener('click', (e) => {
        if (e.target === ov) {
            hideOverlayElement(ov);
        }
    });
});

// Highlighted case study sticky header: initialize behavior for every case-study overlay
document.querySelectorAll('.overlay.case-study').forEach(caseOverlay => {
    const caseArticle = caseOverlay.querySelector('article');
    const stickyHeader = caseOverlay.querySelector('.case-sticky-header');
    const trigger = caseOverlay.querySelector('.case-study-details');

    if (!(caseArticle && stickyHeader && trigger)) return;

    // Listen to the scroll on the scrollable article element
    caseArticle.addEventListener('scroll', () => {
        const showAt = trigger.offsetTop; // when article scrollTop passes this, show header
        const scTop = caseArticle.scrollTop;

        if (scTop >= showAt) {
            stickyHeader.classList.add('is-shown');
        } else {
            stickyHeader.classList.remove('is-shown');
        }
        // update active nav link is now handled by IntersectionObserver (see below)
    });

    // Anchor clicks: scroll the article to the corresponding header and set active immediately
    const navAnchors = Array.from(caseOverlay.querySelectorAll('.case-sticky-nav a'));
    navAnchors.forEach(a => {
        a.addEventListener('click', (evt) => {
            evt.preventDefault();
            const targetId = a.getAttribute('href').slice(1);
            const target = caseArticle.querySelector('#' + targetId);
            if (target) {
                // set active class immediately for instant feedback
                navAnchors.forEach(n => n.classList.remove('active'));
                a.classList.add('active');
                caseArticle.scrollTo({ top: target.offsetTop - 16, behavior: 'smooth' });
                // ensure sticky header visible when jumping
                stickyHeader.classList.add('is-shown');
            }
        });
    });

    // Use IntersectionObserver to track which header is in view and toggle `.active` on nav links
    const headers = Array.from(caseArticle.querySelectorAll('h3.cs-header'));
    if (headers.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;

                const id = entry.target.id;
                if (!id) return;

                navAnchors.forEach(link => {
                    link.classList.toggle(
                        'active',
                        link.getAttribute('href') === `#${id}`
                    );
                });
            });
        }, {
            root: caseArticle,
            threshold: 0,
            rootMargin: '-30% 0px -60% 0px'
        });


        headers.forEach(h => observer.observe(h));
    }
});

// Case study prev-next navigation

document.addEventListener('DOMContentLoaded', () => {
    // IDs of case studies for reference
    const CASE_STUDY_IDS = [
        'project-gamified-learning',
        'project-mobile-finance',
        'project-coding-assistant',
        'project-smb-automation',
        'project-website-automation'
    ];

    let currentCaseIndex = -1;

    function openCaseStudy(id) {
        const overlays = document.querySelectorAll('.overlay.case-study');
        const target = document.getElementById(id);
        if (!target) return;

        // Close any visible case-study overlays using the helper
        overlays.forEach(o => {
            if (!o.classList.contains('hidden')) {
                hideOverlayElement(o);
            }
        });

        // Open target case study using helper (ensures scroll-lock counter updates)
        showOverlayElement(target);
        target.setAttribute('aria-hidden', 'false');

        // Track current index
        currentCaseIndex = CASE_STUDY_IDS.indexOf(id);

        // Reset inner article scroll position if present
        const article = target.querySelector('article');
        if (article) article.scrollTop = 0;

        // Update prev / next button states
        updateCaseNavButtons(target);
    }

    function goToCase(direction) {
    const nextIndex = currentCaseIndex + direction;

    if (nextIndex < 0 || nextIndex >= CASE_STUDY_IDS.length) {
        return;
    }

    // If no case is currently open, just open the target
    if (currentCaseIndex === -1) {
        openCaseStudy(CASE_STUDY_IDS[nextIndex]);
        return;
    }

    const fromId = CASE_STUDY_IDS[currentCaseIndex];
    const toId = CASE_STUDY_IDS[nextIndex];
    const fromOverlay = document.getElementById(fromId);
    const toOverlay = document.getElementById(toId);
    if (!toOverlay) return;

    // Show incoming overlay so its article can animate into view
    // Temporarily make incoming overlay background transparent and stack above the current one
    const originalBg = toOverlay.style.backgroundColor;
    const originalZ = toOverlay.style.zIndex;
    if (fromOverlay) fromOverlay.style.zIndex = '1';
    toOverlay.style.zIndex = '2';
    toOverlay.style.backgroundColor = 'transparent';

    // Prevent any scrollbars on the overlay containers themselves during transition
    const originalToOverlayOverflow = toOverlay.style.overflow;
    toOverlay.style.overflow = 'hidden';

    // Disable transition on overlays to prevent vertical "opening" animation (bounce)
    // or interference during the lateral slide
    toOverlay.style.transition = 'none';

    let originalFromOverlayOverflow = '';
    if (fromOverlay) {
        originalFromOverlayOverflow = fromOverlay.style.overflow;
        fromOverlay.style.overflow = 'hidden';
        fromOverlay.style.transition = 'none';
    }

    showOverlayElement(toOverlay);
    toOverlay.setAttribute('aria-hidden', 'false');

    const fromArticle = fromOverlay ? fromOverlay.querySelector('article') : null;
    const toArticle = toOverlay.querySelector('article');

    // Reset incoming scroll
    if (toArticle) toArticle.scrollTop = 0;

    // Animation class mapping: next => outgoing left, incoming from right; prev => outgoing right, incoming from left
    const outgoingClass = direction === 1 ? 'pt-page-moveToLeft' : 'pt-page-moveToRight';
    const incomingClass = direction === 1 ? 'pt-page-moveFromRight' : 'pt-page-moveFromLeft';

    // Clean previous animation classes on target
    if (!toArticle) return;
    toArticle.classList.remove('pt-page-moveToLeft','pt-page-moveToRight','pt-page-moveFromLeft','pt-page-moveFromRight');
    // force reflow so the animation can restart
    void toArticle.offsetWidth;

    // Position the incoming article absolutely so the existing article (and its scrollbar)
    // remains visible and fixed during the transition. Ensure it sits under fixed controls.
    const originalPosition = toArticle.style.position || '';
    const originalTop = toArticle.style.top || '';
    const originalLeft = toArticle.style.left || '';
    const originalWidth = toArticle.style.width || '';
    const originalHeight = toArticle.style.height || '';
    const originalOverflow = toArticle.style.overflow || '';
    const originalArticleZ = toArticle.style.zIndex || '';

    toArticle.style.position = 'absolute';
    toArticle.style.top = '0';
    toArticle.style.left = '0';
    toArticle.style.width = '100%';
    toArticle.style.height = '100%';
    toArticle.style.overflow = 'hidden';
    // Keep it below fixed controls which use z-index ~1200
    toArticle.style.zIndex = '10';

    // Start incoming animation only (incoming slides over the static previous article)
    // Add a global class to freeze title text (prevents flashing in both articles)
    document.documentElement.classList.add('case-transitioning');

    // Also hide scrollbar on the outgoing article to avoid double scrollbars or moving scrollbars
    if (fromArticle) fromArticle.style.overflow = 'hidden';

    toArticle.classList.add(incomingClass);

    let finished = false;
    const finish = () => {
        if (finished) return;
        finished = true;

        // cleanup animation classes
        if (fromArticle) {
            fromArticle.classList.remove(outgoingClass);
            fromArticle.style.overflow = ''; // Restore overflow
        }
        if (toArticle) toArticle.classList.remove(incomingClass);

        // hide the previous overlay now that its article has animated out
        if (fromOverlay) {
            // Manually remove is-open here so hideOverlayElement sees it as "already closed"
            // and performs an immediate hide (updating count/scroll lock) instead of waiting for a transition.
            // This prevents the "ghost" fromOverlay from sitting on top of the new one for 600ms (Z-index issue).
            fromOverlay.classList.remove('is-open');
            hideOverlayElement(fromOverlay);
            fromOverlay.setAttribute('aria-hidden', 'true');
            fromOverlay.style.overflow = originalFromOverlayOverflow;
            fromOverlay.style.transition = ''; // Restore transition
        }

        // restore any temporary styles applied to incoming overlay
        toOverlay.style.backgroundColor = originalBg || '';
        toOverlay.style.zIndex = originalZ || '';
        toOverlay.style.overflow = originalToOverlayOverflow; // Restore overflow
        toOverlay.style.transition = ''; // Restore transition

        if (fromOverlay) fromOverlay.style.zIndex = '';

        // remove global transition freeze
        document.documentElement.classList.remove('case-transitioning');

        // update index and nav buttons
        currentCaseIndex = nextIndex;
        updateCaseNavButtons(toOverlay);
    };

    // Listen for animationend on the incoming article (fallback to timeout)
    const onAnimEnd = (e) => {
        if (e && e.target !== e.currentTarget) return;

        // restore incoming article inline styles
        toArticle.classList.remove(incomingClass);
        toArticle.style.position = originalPosition;
        toArticle.style.top = originalTop;
        toArticle.style.left = originalLeft;
        toArticle.style.width = originalWidth;
        toArticle.style.height = originalHeight;
        toArticle.style.overflow = originalOverflow;
        toArticle.style.zIndex = originalArticleZ;

        finish();
        toArticle.removeEventListener('animationend', onAnimEnd);
    };

    toArticle.addEventListener('animationend', onAnimEnd);

    // Safety fallback
    setTimeout(() => finish(), 900);
    }

    function updateCaseNavButtons(overlay) {
    const prevBtn = overlay.querySelector('.btn-prev');
    const nextBtn = overlay.querySelector('.btn-next');

    if (prevBtn) {
        prevBtn.disabled = currentCaseIndex === 0;
    }

    if (nextBtn) {
        nextBtn.disabled =
        currentCaseIndex === CASE_STUDY_IDS.length - 1;
    }
    }

    document.addEventListener('click', (e) => {
    if (e.target.closest('.btn-next')) {
        goToCase(1);
    }

    if (e.target.closest('.btn-prev')) {
        goToCase(-1);
    }
    });

    // Note: buttons with `data-modal` are handled above. Removed duplicate
    // document-level handler that also opened case studies to avoid open/close races.

    document.addEventListener('keydown', (e) => {
    if (currentCaseIndex === -1) return;

    if (e.key === 'ArrowRight') {
        goToCase(1);
    }

    if (e.key === 'ArrowLeft') {
        goToCase(-1);
    }
    });
    // Expose opener so other handlers (attached earlier) can call it safely
    globalThis.openCaseStudy = openCaseStudy;
    globalThis.goToCase = goToCase;

});


