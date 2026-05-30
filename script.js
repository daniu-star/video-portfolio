document.addEventListener('DOMContentLoaded', function() {
    var videoData = {
        documentary: [
            { src: '视频合集/AI纪录片《何以为家》.mp4', poster: '65510df2ff3dcba1c3b5dd2419f86e97.jpg', title: 'AI纪录片《何以为家》', desc: { 光影: '低色温暖调柔光为主，逆光剪影强化身份迷失的视觉隐喻，局部硬光打亮面部制造明暗割裂', 镜头: '固定长镜头保持纪实凝视感，缓慢推拉引导沉浸，全景→中景→特写递进构建情感压迫', 风格: '纪实人文风，诗意留白叙事，弱化旁白依赖视觉情绪传递', 节奏: '沉稳舒缓，留白与沉默交替推进，情绪在压抑与释放间缓慢蓄力' } },
            { src: '视频合集/AI纪录片《沁园春·雪》.mp4', poster: 'posters/documentary-2.jpg', title: 'AI纪录片《沁园春·雪》', desc: { 光影: '高色温冷调漫射光营造雪域苍茫，侧逆光勾勒山脊轮廓，晨昏金光穿插制造冷暖转折', 镜头: '航拍大全景开篇建立山河格局，缓慢横移展现纵深，景别递进对应诗词起承转合', 风格: '史诗诗意风，东方写意美学，视觉节奏对仗诗词韵律', 节奏: '宏大舒缓，气势铺陈与意境留白交替，长镜头延展空间感' } }
        ],
        ads: [
            { src: '视频合集/广告片1.mp4', poster: 'posters/ads-1.jpg', title: '爆炸盐，炸掉所有烦恼', desc: { 光影: '高对比硬光制造爆破质感，瞬间强闪光效模拟爆炸冲击，冷白主光+暗部压深强化科技冷峻感', 镜头: '快速推拉+微距特写捕捉颗粒飞溅，全景与极近特写间跳切，以视觉震荡传递"炸裂"概念', 风格: '科技爆破风，以爆炸视觉隐喻情绪释放，高饱和冷色调构建品牌科技感', 节奏: '爆裂快切，毫秒级闪帧制造冲击峰值，静→爆→静三段式节奏强化记忆点' } },
            { src: '视频合集/广告片2.mp4', poster: 'posters/ads-2.jpg', title: '沐萌美，油污跑光亮晶晶', desc: { 光影: '高调柔光营造清透质感，自然侧光勾勒产品光泽，过曝高光区暗示洁净效果', 镜头: '中景生活场景→特写产品细节递进，旋转环绕展示去污过程，浅景深聚焦清洁瞬间', 风格: '清新生活风，明快视觉调性，以干净画面语言呼应产品功能诉求', 节奏: '轻快律动，问题→解决短促切换，结尾定格亮洁画面强化品牌印象' } },
            { src: '视频合集/广告片3.mp4', poster: 'posters/ads-3.jpg', title: '一滴浓，一身净', desc: { 光影: '动态侧光勾勒运动肌肉线条，逆光轮廓光强化身体张力，冷暖光交替映射状态转换', 镜头: '跟拍捕捉运动轨迹，升格慢动作放大力量瞬间，全身→局部快速切换传递活力', 风格: '运动活力风，力量美学，高对比高饱和视觉强化品牌能量感', 节奏: '快慢交替，慢动作蓄力→正常速度释放，爆发节奏驱动情绪攀升' } },
            { src: '视频合集/广告片4.mp4', poster: 'posters/ads-4.jpg', title: '油污净，秒除污', desc: { 光影: '去污前冷灰低调→去污后暖白高调，色温转换直映清洁效果，侧光打亮洁净表面', 镜头: '微距特写污渍细节→中景展示清洁过程，对比构图左右分屏或前后跳切', 风格: '功能演示风，视觉对比为核心策略，干净利落画面语言呼应"秒除"诉求', 节奏: '干脆利落，问题→解决两拍式快切，零冗余节奏传递高效去污产品力' } },
            { src: '视频合集/广告片5.mp4', poster: 'posters/ads-5.jpg', title: 'AD钙，用心包裹儿时科幻梦', desc: { 光影: '霓虹冷光与暖调柔光交织营造科幻梦境质感，光晕漫射柔化边缘，低角度光打亮产品制造童话光环', 镜头: '仰拍广角营造儿童仰望视角，微距捕捉产品细节，奇幻大场景与产品特写间跳跃', 风格: '童趣科幻风，梦幻视觉包裹产品，以想象力叙事替代功能说教', 节奏: '奇幻跳跃，场景快速切换模拟儿童注意力节奏，惊喜感持续输出' } },
            { src: '视频合集/广告片6.mp4', poster: 'posters/ads-6.jpg', title: '陪你酸酸甜甜，陪你可可爱爱', desc: { 光影: '暖调逆光营造柔美轮廓，柔焦光晕包裹画面，自然散射光制造温馨氛围，高光微过曝传递甜蜜感', 镜头: '浅景深特写聚焦表情与产品，缓慢摇移跟随情感流动，中近景为主保持亲密感', 风格: '温馨治愈风，柔美视觉调性，以陪伴感叙事替代产品推销', 节奏: '温柔舒缓，情感递进如呼吸般自然，甜蜜与可爱情绪交替流淌' } },
            { src: '视频合集/广告片7.mp4', poster: 'posters/ads-7.jpg', title: '东方美学，飘逸灵动', desc: { 光影: '柔光漫射营造梦幻氛围，彩色滤光片创造艺术感光影，水波纹反射增添灵动质感', 镜头: '慢动作捕捉飘逸动感，推镜头聚焦设计亮点，全景展现造型→中景展示搭配→近景捕捉面料质感', 风格: '东方时尚风，融合美学，以飘逸视觉语言传递品牌艺术调性', 节奏: '优雅灵动，场景流转如丝般顺滑，艺术感与商业感平衡推进' } }
        ],
        game: [
            { src: '视频合集/长游戏AI视频1.mp4', poster: 'posters/game-1.jpg', title: '三角洲委托——多元素引流', desc: { 光影: '多光源混合打光，冷暖交替营造奇幻层次感，体积光穿透雾气制造空间纵深', 镜头: '航拍→跟拍→特写多视角快速切换，景别跳变串联多元游戏元素，横移展现场景广度', 风格: '奇幻混搭风，多元视觉元素密集输出，以丰富度吸引不同玩家群体', 节奏: '快慢交错，元素轮番呈现保持新鲜感，信息密度高但不杂乱' } },
            { src: '视频合集/长游戏AI视频2.mp4', poster: 'posters/game-2.jpg', title: '三角洲委托——冲突化引流', desc: { 光影: '高对比硬光强化金属质感，频闪光效模拟战场爆炸，冷蓝主调+橙红爆炸光制造冲突色温对撞', 镜头: '手持晃动制造临场冲击，快速推拉捕捉战斗瞬间，远景战场与近景机甲间急速切换', 风格: '硬核科幻风，冲突美学，以对抗张力驱动观看欲', 节奏: '急促快切，战斗节奏持续高压，爆炸闪帧制造视觉峰值' } },
            { src: '视频合集/长游戏AI视频3.mp4', poster: 'posters/game-3.jpg', title: '三角洲委托——剧情化引流', desc: { 光影: '低调暗调为主，侧光勾勒暗黑轮廓，局部点光源制造悬疑明暗，深色压暗留出恐惧想象空间', 镜头: '缓慢推近制造压迫逼近感，景深虚化隐藏威胁，中景→特写收缩视野引发好奇与不安', 风格: '暗黑叙事风，哥特美学，以悬念与未知驱动持续观看', 节奏: '压抑缓起，悬念递进如暗流涌动，在窒息感中蓄积爆发' } },
            { src: '视频合集/长游戏AI视频4.mp4', poster: 'posters/game-4.jpg', title: '三角洲委托——洛克王国与三角洲的剧情化、冲突化叙事', desc: { 光影: '自然光为基底，魔幻光效点缀超现实感，冷暖光随叙事情绪转换，体积光营造史诗空间纵深', 镜头: '大全景建立世界观，横移展现场景广度，叙事段中景推进剧情，冲突段快速切换制造对抗', 风格: '开放世界风，史诗叙事，双IP碰撞制造跨世界观奇观', 节奏: '叙事与冲突交替，张弛有度，剧情铺垫→冲突爆发→悬念收尾三段式推进' } },
            { src: '视频合集/长游戏AI视频5.mp4', poster: 'posters/game-5.jpg', title: '三角洲委托——真人化仿真叙事', desc: { 光影: '仿真自然光为主，环境光反射模拟真实光感，避免人工补光痕迹，以纪实光效消解AI生成感', 镜头: '肩扛跟拍制造呼吸感，纪实视角保持临场真实，中近景为主贴近人物，偶发晃动增强仿真可信度', 风格: '伪纪实风，仿真叙事，以真实感消解虚拟边界，模糊AI与实拍界限', 节奏: '纪实节奏，沉浸推进，去戏剧化处理保持生活流质感' } },
            { src: '视频合集/长游戏AI视频6.mp4', poster: 'posters/game-6.jpg', title: '三角洲委托——生活化叙事引流', desc: { 光影: '灰调漫射光营造废墟阴郁，低色温微暖光暗示生存希望，阴天散射光消除硬影传递末日氛围', 镜头: '固定镜头凝视荒芜环境，缓慢横移展现生存空间，中景记录日常动作，克制运镜反衬生存沉重', 风格: '末日写实风，荒凉美学，以生活化细节消解末日奇观化', 节奏: '缓慢沉重，生存压迫感持续低频，偶发危机瞬间打破日常' } },
            { src: '视频合集/长游戏AI视频7.mp4', poster: 'posters/game-7.jpg', title: '短剧化AI视频', desc: { 光影: '侧逆光勾勒武侠人物轮廓，明暗对比强化招式力量感，暖黄烛光与冷月光的色温对立营造江湖氛围', 镜头: '升格慢动作放大招式瞬间，快速切换捕捉对攻节奏，全景→特写定格关键帧强化武术美感', 风格: '武侠动作风，东方暴力美学，以短剧叙事框架承载武打奇观', 节奏: '动静交替，招式蓄力慢放→交锋快切，武侠韵律驱动叙事推进' } }
        ],
        real: [
            { src: '视频合集/纪录片——东兴电商宣传.mp4', poster: 'posters/real-2.jpg', title: '纪录片——东兴电商宣传', desc: { 光影: '混合光源，室内暖光营造电商工作温度，室外自然光展现物流实景，补光均匀保持画面通透', 镜头: '采访固定镜头保持叙事稳定，跟拍展现物流动态，中景叙事→特写捕捉人物情绪', 风格: '现代纪实风，发展叙事，以人物故事承载产业变迁', 节奏: '稳健推进，数据呈现与人物故事交织，理性与感性双线并行' } },
            { src: '视频合集/实拍纪录片——五四青年节.mp4', poster: 'posters/real-3.jpg', title: '实拍纪录片——五四青年节', desc: { 光影: '明亮自然光为主，高调画面传递青春朝气，侧光勾勒青年轮廓，逆光光晕营造理想主义氛围', 镜头: '动态跟拍捕捉青年活力，升格慢动作定格奋斗瞬间，中近景为主保持情感亲近', 风格: '青春纪实风，朝气视觉调性，以真实力量替代口号式表达', 节奏: '明快昂扬，激情递进，从个体奋斗到群体共鸣逐步升温' } },
            { src: '视频合集/实拍纪录片——广西三月三.mp4', poster: 'posters/real-1.jpg', title: '实拍纪录片——广西三月三', desc: { 光影: '自然日光为主，暖调环境光还原节日热烈，逆光拍摄歌舞剪影强化仪式感，室内烛光补充人文温度', 镜头: '纪实跟拍捕捉民俗自然感，仪式段落固定镜头保持庄重，全景→中景→特写传递文化厚度', 风格: '民族纪实风，人文关怀视角，以真实记录替代奇观化呈现', 节奏: '节庆律动，仪式庄重与生活欢快交织，情绪在传统与现代间自然流转', 荣誉: '广西日报年度最佳宣传片、广西自治区党委宣传部表彰' } }
        ]
    };

    var currentCategory = '';
    var currentIndex = 0;
    var playerVideo = document.getElementById('player-video');
    var isPlaying = false;
    var isCurtainOpen = false;

    function showLayer(id) {
        document.querySelectorAll('.page-layer').forEach(function(layer) {
            layer.classList.remove('active');
        });
        document.getElementById(id).classList.add('active');
    }

    var enterPortfolioEl = document.getElementById('enter-portfolio');
    if (enterPortfolioEl) enterPortfolioEl.addEventListener('click', function() {
        var landing = document.getElementById('layer-landing');
        var hub = document.getElementById('layer-hub');

        var enterAudio = new Audio('sounds/click-documentary.wav');
        enterAudio.volume = 0.35;
        enterAudio.play().catch(function() {});

        landing.classList.add('leaving');

        setTimeout(function() {
            hub.classList.add('active');
            hub.style.transform = 'scale(0.95)';
            hub.style.opacity = '0';
            hub.style.transition = 'none';

            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    hub.style.transition = 'opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    hub.style.opacity = '1';
                    hub.style.transform = 'scale(1)';
                });
            });

            var chars = document.querySelectorAll('.hub-title-char');
            chars.forEach(function(c) { c.classList.remove('written'); });
            setTimeout(function() {
                chars.forEach(function(c, i) {
                    setTimeout(function() {
                        c.classList.add('written');
                    }, i * 400);
                });
            }, 300);
        }, 800);

        setTimeout(function() {
            landing.classList.remove('active', 'leaving');
            landing.style.clipPath = '';
            hub.style.transition = '';
            hub.style.transform = '';
            hub.style.opacity = '';
        }, 2500);
    });

    var enterProfileEl = document.getElementById('enter-profile');
    if (enterProfileEl) enterProfileEl.addEventListener('click', function() {
        var landing = document.getElementById('layer-landing');
        var profile = document.getElementById('layer-profile');

        var enterAudio = new Audio('sounds/click-documentary.wav');
        enterAudio.volume = 0.35;
        enterAudio.play().catch(function() {});

        landing.classList.add('leaving');

        setTimeout(function() {
            profile.classList.add('active');
            profile.style.transform = 'scale(0.95)';
            profile.style.opacity = '0';
            profile.style.transition = 'none';

            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    profile.style.transition = 'opacity 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    profile.style.opacity = '1';
                    profile.style.transform = 'scale(1)';
                });
            });

            var photoArea = document.querySelector('.profile-photo-area');
            if (photoArea) {
                photoArea.style.opacity = '0';
                photoArea.style.transform = 'translateY(20px)';
                photoArea.style.transition = 'none';
                setTimeout(function() {
                    photoArea.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    photoArea.style.opacity = '1';
                    photoArea.style.transform = 'translateY(0)';
                }, 400);
            }

            var sections = document.querySelectorAll('.profile-section');
            sections.forEach(function(sec, i) {
                sec.classList.remove('visible');
                setTimeout(function() {
                    sec.classList.add('visible');
                }, 600 + i * 300);
            });
        }, 800);

        setTimeout(function() {
            landing.classList.remove('active', 'leaving');
            profile.style.transition = '';
            profile.style.transform = '';
            profile.style.opacity = '';
        }, 2500);
    });

    var profileBackEl = document.getElementById('profile-back');
    if (profileBackEl) profileBackEl.addEventListener('click', function() {
        var landing = document.getElementById('layer-landing');
        var profile = document.getElementById('layer-profile');

        profile.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        profile.style.opacity = '0';
        profile.style.transform = 'scale(0.95)';

        setTimeout(function() {
            landing.classList.remove('leaving');
            landing.style.filter = '';
            landing.classList.add('active');
            landing.style.opacity = '0';
            landing.style.transform = 'scale(1.05)';

            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    landing.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    landing.style.opacity = '1';
                    landing.style.transform = 'scale(1)';
                });
            });
        }, 400);

        setTimeout(function() {
            profile.classList.remove('active');
            profile.style.transition = '';
            profile.style.opacity = '';
            profile.style.transform = '';
            landing.style.transition = '';
            landing.style.opacity = '';
            landing.style.transform = '';
        }, 1500);
    });

    var hubBackEl = document.getElementById('hub-back');
    if (hubBackEl) hubBackEl.addEventListener('click', function() {
        var landing = document.getElementById('layer-landing');
        var hub = document.getElementById('layer-hub');

        hub.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        hub.style.opacity = '0';
        hub.style.transform = 'scale(0.95)';

        setTimeout(function() {
            landing.classList.remove('leaving');
            landing.style.filter = '';
            landing.classList.add('active');
            landing.style.opacity = '0';
            landing.style.transform = 'scale(1.05)';

            requestAnimationFrame(function() {
                requestAnimationFrame(function() {
                    landing.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                    landing.style.opacity = '1';
                    landing.style.transform = 'scale(1)';
                });
            });
        }, 400);

        setTimeout(function() {
            hub.classList.remove('active');
            hub.style.transition = '';
            hub.style.opacity = '';
            hub.style.transform = '';
            landing.style.transition = '';
            landing.style.opacity = '';
            landing.style.transform = '';
        }, 1500);
    });

    var soundMap = {
        documentary: 'sounds/click-documentary.wav',
        ads: 'sounds/click-ads.wav',
        game: 'sounds/click-game.wav',
        real: 'sounds/click-real.wav'
    };

    var catInfo = {
        documentary: { title: 'AI纪录片', en: 'AI Documentary', color: 'var(--cat-documentary)' },
        ads: { title: 'AI广告片', en: 'AI Commercial', color: 'var(--cat-ads)' },
        game: { title: '长AI游戏视频', en: 'AI Game Video', color: 'var(--cat-game)' },
        real: { title: '实拍纪录片', en: 'Documentary', color: 'var(--cat-real)' }
    };

    var isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    function pauseAllCardVideos() {
        document.querySelectorAll('.grid-card-thumb video').forEach(function(v) {
            v.pause();
            v.style.opacity = '0';
        });
    }

    function populateGrid(cat) {
        var videos = videoData[cat];
        if (!videos) return;
        var info = catInfo[cat] || {};

        document.getElementById('grid-cat-label').textContent = 'CATEGORY';
        document.getElementById('grid-cat-title').textContent = info.title || '';
        document.getElementById('grid-cat-subtitle').textContent = info.en || '';

        var cardsContainer = document.getElementById('grid-cards');
        cardsContainer.innerHTML = '';

        videos.forEach(function(v, idx) {
            var card = document.createElement('div');
            card.className = 'grid-video-card';
            card.setAttribute('data-index', idx);

            var tagHtml = '';
            if (v.desc) {
                var tagKeys = Object.keys(v.desc).slice(0, 3);
                tagHtml = tagKeys.map(function(k) {
                    return '<span class="grid-card-tag">' + k + '</span>';
                }).join('');
            }

            var badgeHtml = idx === 0 ? '<div class="grid-card-featured-badge">精选</div>' : '';

            card.innerHTML =
                '<div class="grid-card-thumb">' +
                    '<img src="' + v.poster + '" alt="' + v.title + '" loading="lazy" onerror="this.style.display=\'none\'">' +
                    '<video preload="none" muted loop playsinline webkit-playsinline x5-playsinline x5-video-player-type="h5"></video>' +
                    '<div class="grid-card-gradient"></div>' +
                    badgeHtml +
                    '<div class="grid-card-info">' +
                        '<div class="grid-card-title">' + v.title + '</div>' +
                        (tagHtml ? '<div class="grid-card-tags">' + tagHtml + '</div>' : '') +
                    '</div>' +
                    '<div class="grid-card-play">' +
                        '<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="8,5 20,12 8,19"/></svg>' +
                    '</div>' +
                '</div>';

            var videoEl = card.querySelector('video');

            if (!isTouchDevice) {
                card.addEventListener('mouseenter', function() {
                    if (!videoEl.src) {
                        videoEl.src = v.src;
                    }
                    videoEl.style.opacity = '0.6';
                    videoEl.play().catch(function() {});
                });

                card.addEventListener('mouseleave', function() {
                    videoEl.pause();
                    videoEl.style.opacity = '0';
                });
            }

            card.addEventListener('click', function() {
                currentIndex = idx;
                loadVideo();
                transitionGridToPlayer();
            });

            cardsContainer.appendChild(card);
        });
    }

    function transitionHubToGrid(cat) {
        var hub = document.getElementById('layer-hub');
        var grid = document.getElementById('layer-grid');

        populateGrid(cat);

        grid.classList.add('active');
        grid.style.opacity = '0';
        grid.style.transform = 'scale(1.03)';
        grid.style.transition = 'none';

        hub.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        hub.style.opacity = '0';
        hub.style.transform = 'scale(0.96)';

        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                grid.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                grid.style.opacity = '1';
                grid.style.transform = 'scale(1)';
            });
        });

        setTimeout(function() {
            hub.classList.remove('active');
            hub.style.transition = '';
            hub.style.opacity = '';
            hub.style.transform = '';
            grid.style.transition = '';
            grid.style.transform = '';
            grid.style.opacity = '';
        }, 1200);
    }

    function transitionGridToPlayer() {
        pauseAllCardVideos();
        var grid = document.getElementById('layer-grid');
        var player = document.getElementById('layer-player');

        player.classList.add('active');
        player.style.opacity = '0';
        player.style.transform = 'scale(1.03)';
        player.style.transition = 'none';

        grid.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        grid.style.opacity = '0';
        grid.style.transform = 'scale(0.96)';

        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                player.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                player.style.opacity = '1';
                player.style.transform = 'scale(1)';
            });
        });

        setTimeout(function() {
            grid.classList.remove('active');
            grid.style.transition = '';
            grid.style.opacity = '';
            grid.style.transform = '';
            player.style.transition = '';
            player.style.transform = '';
            player.style.opacity = '';
        }, 1000);
    }

    document.querySelectorAll('.hub-category').forEach(function(cat) {
        cat.addEventListener('click', function(e) {
            e.preventDefault();
            currentCategory = this.getAttribute('data-category');

            var soundFile = soundMap[currentCategory];
            if (soundFile) {
                var audio = new Audio(soundFile);
                audio.volume = 0.3;
                audio.play().catch(function() {});
            }

            currentIndex = 0;
            transitionHubToGrid(currentCategory);
        });
    });

    var gridBackEl = document.getElementById('grid-back');
    if (gridBackEl) gridBackEl.addEventListener('click', function() {
        pauseAllCardVideos();
        var grid = document.getElementById('layer-grid');
        var hub = document.getElementById('layer-hub');

        grid.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        grid.style.opacity = '0';
        grid.style.transform = 'scale(0.96)';

        hub.classList.add('active');
        hub.style.opacity = '0';
        hub.style.transform = 'scale(1.03)';
        hub.style.transition = 'none';

        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                hub.style.transition = 'opacity 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                hub.style.opacity = '1';
                hub.style.transform = 'scale(1)';
            });
        });

        setTimeout(function() {
            grid.classList.remove('active');
            grid.style.transition = '';
            grid.style.opacity = '';
            grid.style.transform = '';
            hub.style.transition = '';
            hub.style.opacity = '';
            hub.style.transform = '';
        }, 1200);
    });

    var btnBackHubEl = document.getElementById('btn-back-hub');
    if (btnBackHubEl) btnBackHubEl.addEventListener('click', function() {
        if (playerVideo) { playerVideo.pause(); playerVideo.removeAttribute('src'); playerVideo.load(); }
        isPlaying = false;
        isCurtainOpen = false;

        var player = document.getElementById('layer-player');
        var grid = document.getElementById('layer-grid');

        populateGrid(currentCategory);

        grid.classList.add('active');
        grid.style.opacity = '0';
        grid.style.transform = 'scale(1.03)';
        grid.style.transition = 'none';

        player.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        player.style.opacity = '0';
        player.style.transform = 'scale(0.96)';

        requestAnimationFrame(function() {
            requestAnimationFrame(function() {
                grid.style.transition = 'opacity 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                grid.style.opacity = '1';
                grid.style.transform = 'scale(1)';
            });
        });

        setTimeout(function() {
            player.classList.remove('active');
            player.style.transition = '';
            player.style.opacity = '';
            player.style.transform = '';
            grid.style.transition = '';
            grid.style.opacity = '';
            grid.style.transform = '';
        }, 1000);
    });

    function loadVideo() {
        var videos = videoData[currentCategory];
        if (!videos || !videos[currentIndex]) return;
        var v = videos[currentIndex];

        clearVideoLoadTimeout();
        videoRetryCount = 0;

        var wrapper = document.getElementById('player-video-wrapper');
        var errEl = wrapper.querySelector('.video-load-error');
        if (errEl) errEl.parentNode.removeChild(errEl);

        document.getElementById('player-cat-label').textContent = getCategoryName(currentCategory);
        document.getElementById('player-title').textContent = v.title;

        var posterUrl = v.poster;
        var curtainLeft = document.getElementById('poster-curtain-left');
        var curtainRight = document.getElementById('poster-curtain-right');
        curtainLeft.style.backgroundImage = 'url(' + posterUrl + ')';
        curtainRight.style.backgroundImage = 'url(' + posterUrl + ')';
        curtainLeft.style.backgroundSize = '200% 100%';
        curtainRight.style.backgroundSize = '200% 100%';
        curtainLeft.style.backgroundPosition = 'left center';
        curtainRight.style.backgroundPosition = 'right center';

        curtainLeft.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
        curtainRight.style.clipPath = 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)';
        document.getElementById('poster-curtain-seam').classList.remove('hidden');
        document.getElementById('curtain-trigger').classList.remove('hidden');
        isCurtainOpen = false;

        if (playerVideo) {
            playerVideo.removeAttribute('src');
            playerVideo.load();
        }
        isPlaying = false;

        var infoEl = document.getElementById('player-info');
        infoEl.innerHTML = '';
        if (v.desc) {
            Object.keys(v.desc).forEach(function(key) {
                var item = document.createElement('div');
                item.className = 'desc-item';
                item.innerHTML = '<span class="desc-label">' + key + '</span><span class="desc-text">' + v.desc[key] + '</span>';
                infoEl.appendChild(item);
            });
        }

        var progressBar = document.getElementById('ctrl-progress-bar');
        if (progressBar) progressBar.style.width = '0%';
        var timeEl = document.getElementById('ctrl-time');
        if (timeEl) timeEl.textContent = '0:00 / 0:00';
    }

    function getCategoryName(cat) {
        var names = { documentary: 'AI纪录片', ads: 'AI广告片', game: '长AI游戏视频', real: '实拍纪录片' };
        return names[cat] || '';
    }

    function closeCurtainWithWave() {
        isCurtainOpen = false;
        var curtainLeft = document.getElementById('poster-curtain-left');
        var curtainRight = document.getElementById('poster-curtain-right');
        var seam = document.getElementById('poster-curtain-seam');
        var trigger = document.getElementById('curtain-trigger');

        var duration = 1800;
        var start = null;

        function animateCurtainClose(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);

            var t = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            var waveAmp = 30 * t * (1 - t);
            var edge = t * 50;

            var leftClip = 'polygon(0 0, ' + edge + '% 0';
            for (var i = 0; i <= 10; i++) {
                var y = i * 10;
                var waveOffset = Math.sin(y * 0.3 + (1 - progress) * 6) * waveAmp;
                leftClip += ', ' + (edge + waveOffset * 0.1) + '% ' + y + '%';
            }
            leftClip += ', 0 100%)';

            var rightEdge = 100 - edge;
            var rightClip = 'polygon(' + rightEdge + '% 0';
            for (var j = 0; j <= 10; j++) {
                var y2 = j * 10;
                var waveOffset2 = Math.sin(y2 * 0.3 + (1 - progress) * 6) * waveAmp;
                rightClip += ', ' + (rightEdge - waveOffset2 * 0.1) + '% ' + y2 + '%';
            }
            rightClip += ', 100% 100%, 100% 0%)';

            curtainLeft.style.clipPath = leftClip;
            curtainRight.style.clipPath = rightClip;

            if (progress < 1) {
                requestAnimationFrame(animateCurtainClose);
            } else {
                curtainLeft.style.clipPath = 'polygon(0 0, 50% 0, 50% 100%, 0 100%)';
                curtainRight.style.clipPath = 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)';
                seam.classList.remove('hidden');
                trigger.classList.remove('hidden');
            }
        }

        requestAnimationFrame(animateCurtainClose);
    }

    if (playerVideo) playerVideo.addEventListener('click', function(e) {
        if (isCurtainOpen && isPlaying) {
            playerVideo.pause();
            isPlaying = false;
            closeCurtainWithWave();
        }
    });

    function openCurtainWithWave() {
        var curtainLeft = document.getElementById('poster-curtain-left');
        var curtainRight = document.getElementById('poster-curtain-right');
        var seam = document.getElementById('poster-curtain-seam');
        var trigger = document.getElementById('curtain-trigger');

        trigger.classList.add('hidden');
        seam.classList.add('hidden');
        isCurtainOpen = true;

        var duration = 1800;
        var start = null;

        function animateCurtain(timestamp) {
            if (!start) start = timestamp;
            var progress = Math.min((timestamp - start) / duration, 1);

            var t = progress < 0.5
                ? 4 * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            var waveAmp = 30 * (1 - t * t);
            var edge = 50 - t * 50;

            var leftClip = 'polygon(0 0, ' + edge + '% 0';
            for (var i = 0; i <= 10; i++) {
                var y = i * 10;
                var waveOffset = Math.sin(y * 0.3 + progress * 6) * waveAmp;
                leftClip += ', ' + (edge + waveOffset * 0.1) + '% ' + y + '%';
            }
            leftClip += ', 0 100%)';

            var rightEdge = 100 - edge;
            var rightClip = 'polygon(' + rightEdge + '% 0';
            for (var j = 0; j <= 10; j++) {
                var y2 = j * 10;
                var waveOffset2 = Math.sin(y2 * 0.3 + progress * 6) * waveAmp;
                rightClip += ', ' + (rightEdge - waveOffset2 * 0.1) + '% ' + y2 + '%';
            }
            rightClip += ', 100% 100%, 100% 0%)';

            curtainLeft.style.clipPath = leftClip;
            curtainRight.style.clipPath = rightClip;

            if (progress < 1) {
                requestAnimationFrame(animateCurtain);
            } else {
                curtainLeft.style.clipPath = 'polygon(0 0, 0 0, 0 100%, 0 100%)';
                curtainRight.style.clipPath = 'polygon(100% 0, 100% 0, 100% 100%, 100% 100%)';
            }
        }

        requestAnimationFrame(animateCurtain);
    }

    var videoLoadTimeout = null;
    var videoRetryCount = 0;
    var MAX_VIDEO_RETRIES = 3;

    function clearVideoLoadTimeout() {
        if (videoLoadTimeout) {
            clearTimeout(videoLoadTimeout);
            videoLoadTimeout = null;
        }
    }

    function showVideoError() {
        var loading = document.getElementById('player-loading');
        if (loading) loading.classList.remove('active');
        var wrapper = document.getElementById('player-video-wrapper');
        var existing = wrapper.querySelector('.video-load-error');
        if (!existing) {
            var errDiv = document.createElement('div');
            errDiv.className = 'video-load-error';
            errDiv.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);z-index:10;text-align:center;color:rgba(255,255,255,0.6);font-family:var(--font-body);';
            errDiv.innerHTML = '<div style="font-size:1.2rem;margin-bottom:12px;">视频加载失败</div><button style="background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.2);color:rgba(255,255,255,0.7);padding:8px 20px;cursor:pointer;border-radius:2px;font-family:var(--font-body);letter-spacing:0.1em;" id="retry-video-btn">点击重试</button>';
            wrapper.appendChild(errDiv);
            var retryBtn = document.getElementById('retry-video-btn');
            if (retryBtn) retryBtn.addEventListener('click', function() {
                if (errDiv.parentNode) errDiv.parentNode.removeChild(errDiv);
                retryVideoLoad();
            });
        }
    }

    function retryVideoLoad() {
        var v = videoData[currentCategory][currentIndex];
        if (!v) return;
        var loading = document.getElementById('player-loading');
        if (playerVideo) {
            playerVideo.removeAttribute('src');
            playerVideo.load();
        }
        playerVideo.src = v.src;
        playerVideo.load();
        if (loading) loading.classList.add('active');

        clearVideoLoadTimeout();
        videoLoadTimeout = setTimeout(function() {
            if (!isPlaying) {
                videoRetryCount++;
                if (videoRetryCount < MAX_VIDEO_RETRIES) {
                    retryVideoLoad();
                } else {
                    showVideoError();
                }
            }
        }, 30000);

        playerVideo.addEventListener('canplay', function onCanPlay() {
            playerVideo.removeEventListener('canplay', onCanPlay);
            clearVideoLoadTimeout();
            videoRetryCount = 0;
            if (loading) loading.classList.remove('active');
            playerVideo.play().catch(function() {});
            isPlaying = true;
        }, { once: true });

        playerVideo.addEventListener('error', function onError() {
            playerVideo.removeEventListener('error', onError);
            clearVideoLoadTimeout();
            videoRetryCount++;
            if (videoRetryCount < MAX_VIDEO_RETRIES) {
                retryVideoLoad();
            } else {
                showVideoError();
            }
        }, { once: true });
    }

    var curtainTriggerEl = document.getElementById('curtain-trigger');
    if (curtainTriggerEl) curtainTriggerEl.addEventListener('click', function() {
        var trigger = this;
        var loading = document.getElementById('player-loading');

        openCurtainWithWave();

        if (!playerVideo.src || playerVideo.src === window.location.href) {
            videoRetryCount = 0;
            var v = videoData[currentCategory][currentIndex];
            if (!v) return;
            playerVideo.src = v.src;
            playerVideo.load();
            loading.classList.add('active');

            clearVideoLoadTimeout();
            videoLoadTimeout = setTimeout(function() {
                if (!isPlaying) {
                    videoRetryCount++;
                    if (videoRetryCount < MAX_VIDEO_RETRIES) {
                        retryVideoLoad();
                    } else {
                        showVideoError();
                    }
                }
            }, 30000);

            playerVideo.addEventListener('canplay', function onCanPlay() {
                playerVideo.removeEventListener('canplay', onCanPlay);
                clearVideoLoadTimeout();
                videoRetryCount = 0;
                loading.classList.remove('active');
                playerVideo.play().catch(function() {});
                isPlaying = true;
            }, { once: true });

            playerVideo.addEventListener('error', function onError() {
                playerVideo.removeEventListener('error', onError);
                clearVideoLoadTimeout();
                videoRetryCount++;
                if (videoRetryCount < MAX_VIDEO_RETRIES) {
                    retryVideoLoad();
                } else {
                    showVideoError();
                }
            }, { once: true });
        } else {
            setTimeout(function() {
                playerVideo.play().catch(function() {});
                isPlaying = true;
            }, 1800);
        }
    });

    var btnPrevEl = document.getElementById('btn-prev');
    if (btnPrevEl) btnPrevEl.addEventListener('click', function() {
        var videos = videoData[currentCategory];
        currentIndex = (currentIndex - 1 + videos.length) % videos.length;
        loadVideo();
    });
    var btnNextEl = document.getElementById('btn-next');
    if (btnNextEl) btnNextEl.addEventListener('click', function() {
        var videos = videoData[currentCategory];
        currentIndex = (currentIndex + 1) % videos.length;
        loadVideo();
    });

    var speeds = [0.5, 1, 1.5, 2];
    var speedIdx = 1;
    var ctrlSpeedEl = document.getElementById('ctrl-speed');
    if (ctrlSpeedEl) ctrlSpeedEl.addEventListener('click', function() {
        speedIdx = (speedIdx + 1) % speeds.length;
        playerVideo.playbackRate = speeds[speedIdx];
        this.textContent = speeds[speedIdx] + 'x';
    });

    var ctrlPipEl = document.getElementById('ctrl-pip');
    if (ctrlPipEl) ctrlPipEl.addEventListener('click', function() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture();
        } else if (playerVideo.requestPictureInPicture) {
            playerVideo.requestPictureInPicture().catch(function() {});
        }
    });

    if (playerVideo) playerVideo.addEventListener('timeupdate', function() {
        if (playerVideo.duration > 0) {
            var pct = (playerVideo.currentTime / playerVideo.duration) * 100;
            document.getElementById('ctrl-progress-bar').style.width = pct + '%';
            document.getElementById('ctrl-time').textContent = formatTime(playerVideo.currentTime) + ' / ' + formatTime(playerVideo.duration);
        }
    });

    var ctrlProgressEl = document.getElementById('ctrl-progress');
    if (ctrlProgressEl) ctrlProgressEl.addEventListener('click', function(e) {
        if (playerVideo.duration) {
            var rect = this.getBoundingClientRect();
            var pct = (e.clientX - rect.left) / rect.width;
            playerVideo.currentTime = pct * playerVideo.duration;
        }
    });

    document.addEventListener('keydown', function(e) {
        if (!document.getElementById('layer-player').classList.contains('active')) return;
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            playerVideo.currentTime = Math.max(0, playerVideo.currentTime - 5);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            playerVideo.currentTime = Math.min(playerVideo.duration || 0, playerVideo.currentTime + 5);
        } else if (e.key === ' ') {
            e.preventDefault();
            if (playerVideo.paused) {
                if (!isCurtainOpen) {
                    document.getElementById('curtain-trigger').click();
                } else {
                    playerVideo.play();
                    isPlaying = true;
                }
            } else {
                playerVideo.pause();
                isPlaying = false;
                closeCurtainWithWave();
            }
        } else if (e.key === 'Escape') {
            document.getElementById('btn-back-hub').click();
        }
    });

    function formatTime(s) {
        var m = Math.floor(s / 60);
        var sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

});
